import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { describe, expect, it } from "vitest";
import { SiteDistribution, SiteDistributionProps } from "./SiteDistribution";

function synthesize(
  props: Partial<SiteDistributionProps> = {},
  region = "us-east-1",
) {
  const app = new App();
  const stack = new Stack(app, "Test", {
    env: { account: "123456789012", region },
  });

  new SiteDistribution(stack, "SiteDistribution", {
    origin: new HttpOrigin("example.com"),
    invalidateCache: false,
    ...props,
  });

  return Template.fromStack(stack);
}

describe("SiteDistribution", () => {
  describe("firewall", () => {
    it("has no firewall by default", () => {
      const template = synthesize();

      template.resourceCountIs("AWS::WAFv2::WebACL", 0);
      template.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: Match.objectLike({ WebACLId: Match.absent() }),
      });
    });

    it("creates and attaches a firewall when enabled", () => {
      const template = synthesize({ firewall: true });

      template.resourceCountIs("AWS::WAFv2::WebACL", 1);
      template.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: Match.objectLike({
          WebACLId: {
            "Fn::GetAtt": [Match.stringLikeRegexp("WebAcl"), "Arn"],
          },
        }),
      });
    });

    it("passes firewall configuration through", () => {
      const template = synthesize({ firewall: { rateLimit: false } });

      template.hasResourceProperties("AWS::WAFv2::WebACL", {
        Rules: Match.not(
          Match.arrayWith([Match.objectLike({ Name: "RateLimit" })]),
        ),
      });
    });

    it("attaches an existing web ACL without creating one", () => {
      const webAclArn =
        "arn:aws:wafv2:us-east-1:123456789012:global/webacl/shared/abc";

      const template = synthesize({ firewall: { webAclArn } }, "eu-west-1");

      template.resourceCountIs("AWS::WAFv2::WebACL", 0);
      template.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: Match.objectLike({ WebACLId: webAclArn }),
      });
    });

    it("throws when creating a firewall outside us-east-1", () => {
      expect(() => synthesize({ firewall: true }, "eu-west-1")).toThrow(
        /must be created in us-east-1/,
      );
    });
  });
});
