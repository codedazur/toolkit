import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { Firewall, FirewallProps } from "./Firewall";

function synthesize(props: FirewallProps = {}, region = "us-east-1") {
  const app = new App();
  const stack = new Stack(app, "Test", {
    env: { account: "123456789012", region },
  });

  new Firewall(stack, "Firewall", props);

  return Template.fromStack(stack);
}

function ruleNames(template: Template) {
  const [webAcl] = Object.values(
    template.findResources("AWS::WAFv2::WebACL"),
  ) as { Properties: { Rules: { Name: string }[] } }[];

  return webAcl.Properties.Rules.map((rule) => rule.Name);
}

describe("Firewall", () => {
  it("creates a CloudFront web ACL with default rules", () => {
    const template = synthesize();

    template.hasResourceProperties("AWS::WAFv2::WebACL", {
      Scope: "CLOUDFRONT",
      DefaultAction: { Allow: {} },
    });

    expect(ruleNames(template)).toEqual([
      "RateLimit",
      "AWS-AWSManagedRulesAmazonIpReputationList",
      "AWS-AWSManagedRulesCommonRuleSet",
      "AWS-AWSManagedRulesKnownBadInputsRuleSet",
    ]);

    template.hasResourceProperties("AWS::WAFv2::WebACL", {
      Rules: Match.arrayWith([
        Match.objectLike({
          Name: "RateLimit",
          Priority: 0,
          Action: { Block: {} },
          Statement: {
            RateBasedStatement: {
              Limit: 3000,
              EvaluationWindowSec: 300,
              AggregateKeyType: "IP",
            },
          },
        }),
        Match.objectLike({
          Name: "AWS-AWSManagedRulesCommonRuleSet",
          OverrideAction: { None: {} },
          Statement: {
            ManagedRuleGroupStatement: Match.objectLike({
              RuleActionOverrides: [
                { Name: "SizeRestrictions_BODY", ActionToUse: { Count: {} } },
              ],
            }),
          },
        }),
      ]),
    });
  });

  it("logs blocked and counted requests to a WAF log group", () => {
    const template = synthesize();

    template.hasResourceProperties("AWS::Logs::LogGroup", {
      LogGroupName: Match.stringLikeRegexp("^aws-waf-logs-"),
      RetentionInDays: 30,
    });

    template.hasResourceProperties("AWS::WAFv2::LoggingConfiguration", {
      LogDestinationConfigs: [
        {
          "Fn::Join": [
            "",
            Match.arrayWith([
              Match.stringLikeRegexp(":log-group:aws-waf-logs-"),
            ]),
          ],
        },
      ],
      LoggingFilter: {
        DefaultBehavior: "DROP",
        Filters: [
          Match.objectLike({
            Behavior: "KEEP",
            Conditions: [
              { ActionCondition: { Action: "BLOCK" } },
              { ActionCondition: { Action: "COUNT" } },
              { ActionCondition: { Action: "EXCLUDED_AS_COUNT" } },
            ],
          }),
        ],
      },
    });
  });

  it("can disable logging and the rate limit", () => {
    const template = synthesize({ logging: false, rateLimit: false });

    template.resourceCountIs("AWS::WAFv2::LoggingConfiguration", 0);
    expect(ruleNames(template)).not.toContain("RateLimit");
  });

  it("overrides all rule actions to count in count mode", () => {
    const template = synthesize({
      mode: "count",
      rules: [
        {
          name: "Custom",
          action: { block: {} },
          statement: { geoMatchStatement: { countryCodes: ["XX"] } },
        },
      ],
    });

    template.hasResourceProperties("AWS::WAFv2::WebACL", {
      Rules: [
        Match.objectLike({ Name: "Custom", Action: { Count: {} } }),
        Match.objectLike({ Name: "RateLimit", Action: { Count: {} } }),
        Match.objectLike({ OverrideAction: { Count: {} } }),
        Match.objectLike({ OverrideAction: { Count: {} } }),
        Match.objectLike({ OverrideAction: { Count: {} } }),
      ],
    });
  });

  it("excludes paths from the rate limit", () => {
    const template = synthesize({
      rateLimit: { limit: 100, excludePaths: ["/a/", "/b/"] },
    });

    template.hasResourceProperties("AWS::WAFv2::WebACL", {
      Rules: Match.arrayWith([
        Match.objectLike({
          Name: "RateLimit",
          Statement: {
            RateBasedStatement: Match.objectLike({
              Limit: 100,
              ScopeDownStatement: {
                NotStatement: {
                  Statement: {
                    OrStatement: {
                      Statements: [
                        Match.objectLike({
                          ByteMatchStatement: Match.objectLike({
                            SearchString: "/a/",
                            PositionalConstraint: "STARTS_WITH",
                          }),
                        }),
                        Match.objectLike({
                          ByteMatchStatement: Match.objectLike({
                            SearchString: "/b/",
                          }),
                        }),
                      ],
                    },
                  },
                },
              },
            }),
          },
        }),
      ]),
    });
  });

  it("throws outside us-east-1", () => {
    expect(() => synthesize({}, "eu-west-1")).toThrow(
      /must be created in us-east-1/,
    );
  });
});
