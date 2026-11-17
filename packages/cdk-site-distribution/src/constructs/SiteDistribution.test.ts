import { Firewall } from "@codedazur/cdk-firewall";
import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { describe, expect, it } from "vitest";
import { SiteDistribution } from "./SiteDistribution";

const account = "123456789012";

describe("SiteDistribution", () => {
  describe("firewall", () => {
    it("has no firewall by default", () => {
      const stack = new Stack(new App(), "Test", {
        env: { account, region: "eu-central-1" },
      });

      new SiteDistribution(stack, "SiteDistribution", {
        origin: new HttpOrigin("example.com"),
        invalidateCache: false,
      });

      Template.fromStack(stack).hasResourceProperties(
        "AWS::CloudFront::Distribution",
        {
          DistributionConfig: Match.objectLike({ WebACLId: Match.absent() }),
        },
      );
    });

    it("attaches a firewall from the same stack", () => {
      const stack = new Stack(new App(), "Test", {
        env: { account, region: "us-east-1" },
      });

      new SiteDistribution(stack, "SiteDistribution", {
        origin: new HttpOrigin("example.com"),
        invalidateCache: false,
        firewall: new Firewall(stack, "Firewall"),
      });

      Template.fromStack(stack).hasResourceProperties(
        "AWS::CloudFront::Distribution",
        {
          DistributionConfig: Match.objectLike({
            WebACLId: {
              "Fn::GetAtt": [Match.stringLikeRegexp("WebAcl"), "Arn"],
            },
          }),
        },
      );
    });

    it("attaches a firewall from a us-east-1 stack to a stack in another region", () => {
      const app = new App();

      const edge = new Stack(app, "Edge", {
        env: { account, region: "us-east-1" },
        crossRegionReferences: true,
      });

      const stack = new Stack(app, "Site", {
        env: { account, region: "eu-central-1" },
        crossRegionReferences: true,
      });

      new SiteDistribution(stack, "SiteDistribution", {
        origin: new HttpOrigin("example.com"),
        invalidateCache: false,
        firewall: new Firewall(edge, "Firewall"),
      });

      Template.fromStack(edge).resourceCountIs("AWS::WAFv2::WebACL", 1);

      const site = Template.fromStack(stack);

      site.resourceCountIs("AWS::WAFv2::WebACL", 0);
      site.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: Match.objectLike({
          WebACLId: {
            "Fn::GetAtt": [
              Match.stringLikeRegexp("ExportsReader"),
              Match.anyValue(),
            ],
          },
        }),
      });

      expect(stack.dependencies).toContain(edge);
    });

    it("attaches an imported firewall", () => {
      const stack = new Stack(new App(), "Test", {
        env: { account, region: "eu-central-1" },
      });

      const webAclArn =
        "arn:aws:wafv2:us-east-1:123456789012:global/webacl/shared/abc";

      new SiteDistribution(stack, "SiteDistribution", {
        origin: new HttpOrigin("example.com"),
        invalidateCache: false,
        firewall: Firewall.fromWebAclArn(stack, "Firewall", webAclArn),
      });

      const template = Template.fromStack(stack);

      template.resourceCountIs("AWS::WAFv2::WebACL", 0);
      template.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: Match.objectLike({ WebACLId: webAclArn }),
      });
    });
  });
});
