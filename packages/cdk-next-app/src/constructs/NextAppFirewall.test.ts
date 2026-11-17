import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";
import { NextAppFirewall } from "./NextAppFirewall";
import { FirewallProps } from "@codedazur/cdk-firewall";

function synthesize(props?: FirewallProps) {
  const stack = new Stack(new App(), "Test", {
    env: { account: "123456789012", region: "us-east-1" },
  });

  new NextAppFirewall(stack, "Firewall", props);

  return Template.fromStack(stack);
}

describe("NextAppFirewall", () => {
  it("applies Next.js specific rules", () => {
    synthesize().hasResourceProperties("AWS::WAFv2::WebACL", {
      Rules: Match.arrayWith([
        Match.objectLike({
          Name: "NextMiddlewareSubrequest",
          Priority: 0,
          Action: { Block: {} },
          Statement: {
            SizeConstraintStatement: Match.objectLike({
              FieldToMatch: {
                SingleHeader: { Name: "x-middleware-subrequest" },
              },
            }),
          },
        }),
        Match.objectLike({
          Name: "RateLimit",
          Statement: {
            RateBasedStatement: Match.objectLike({
              Limit: 2000,
              ScopeDownStatement: Match.objectLike({
                NotStatement: Match.anyValue(),
              }),
            }),
          },
        }),
        Match.objectLike({ Name: "AWS-AWSManagedRulesCommonRuleSet" }),
      ]),
    });
  });

  it("evaluates custom rules after the Next.js rules", () => {
    synthesize({
      rules: [
        {
          name: "Custom",
          action: { block: {} },
          statement: { geoMatchStatement: { countryCodes: ["XX"] } },
        },
      ],
    }).hasResourceProperties("AWS::WAFv2::WebACL", {
      Rules: Match.arrayWith([
        Match.objectLike({ Name: "NextMiddlewareSubrequest", Priority: 0 }),
        Match.objectLike({ Name: "Custom", Priority: 1 }),
      ]),
    });
  });

  it("applies other options, such as count mode", () => {
    synthesize({ mode: "count" }).hasResourceProperties("AWS::WAFv2::WebACL", {
      Rules: Match.arrayWith([
        Match.objectLike({
          Name: "NextMiddlewareSubrequest",
          Action: { Count: {} },
        }),
      ]),
    });
  });
});
