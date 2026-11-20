import { App, Duration, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { describe, expect, it } from "vitest";
import {
  Firewall,
  FirewallMode,
  FirewallProps,
  MaskingAction,
} from "./Firewall";
import { FirewallLogBucket } from "./FirewallLogBucket";
import { FirewallLogging } from "./FirewallLogging";

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
      "AWS-AWSManagedRulesAmazonIpReputationList",
      "AWS-AWSManagedRulesCommonRuleSet",
      "AWS-AWSManagedRulesKnownBadInputsRuleSet",
      "AWS-AWSManagedRulesLinuxRuleSet",
      "AWS-AWSManagedRulesUnixRuleSet",
    ]);

    template.hasResourceProperties("AWS::WAFv2::WebACL", {
      Rules: Match.arrayWith([
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

  it("does not log by default", () => {
    const template = synthesize();

    template.resourceCountIs("AWS::WAFv2::LoggingConfiguration", 0);
    template.resourceCountIs("AWS::Logs::LogGroup", 0);
  });

  it("masks the authorization and cookie headers", () => {
    synthesize().hasResourceProperties("AWS::WAFv2::WebACL", {
      DataProtectionConfig: {
        DataProtections: [
          {
            Field: {
              FieldType: "SINGLE_HEADER",
              FieldKeys: ["authorization", "cookie"],
            },
            Action: "SUBSTITUTION",
          },
        ],
      },
    });
  });

  it("merges custom masking with the defaults", () => {
    synthesize({
      masking: {
        headers: {
          Authorization: MaskingAction.HASH,
          "x-api-key": MaskingAction.HASH,
        },
        cookies: { session: MaskingAction.HASH },
        queryParameters: { email: MaskingAction.SUBSTITUTION },
        body: MaskingAction.SUBSTITUTION,
      },
    }).hasResourceProperties("AWS::WAFv2::WebACL", {
      DataProtectionConfig: {
        DataProtections: [
          {
            Field: { FieldType: "SINGLE_HEADER", FieldKeys: ["cookie"] },
            Action: "SUBSTITUTION",
          },
          {
            Field: {
              FieldType: "SINGLE_HEADER",
              FieldKeys: ["authorization", "x-api-key"],
            },
            Action: "HASH",
          },
          {
            Field: { FieldType: "SINGLE_COOKIE", FieldKeys: ["session"] },
            Action: "HASH",
          },
          {
            Field: { FieldType: "SINGLE_QUERY_ARGUMENT", FieldKeys: ["email"] },
            Action: "SUBSTITUTION",
          },
          { Field: { FieldType: "BODY" }, Action: "SUBSTITUTION" },
        ],
      },
    });
  });

  it("can explicitly stop masking a default field", () => {
    synthesize({
      masking: {
        headers: {
          authorization: MaskingAction.NONE,
          cookie: MaskingAction.NONE,
        },
      },
    }).hasResourceProperties("AWS::WAFv2::WebACL", {
      DataProtectionConfig: Match.absent(),
    });
  });

  it("logs blocked and counted requests to a bucket in another region", () => {
    const app = new App();
    const account = "123456789012";

    const logs = new Stack(app, "Logs", {
      env: { account, region: "eu-central-1" },
      crossRegionReferences: true,
    });

    const edge = new Stack(app, "Edge", {
      env: { account, region: "us-east-1" },
      crossRegionReferences: true,
    });

    const bucket = new FirewallLogBucket(logs, "FirewallLogs", {
      expiration: Duration.days(7),
    });

    new Firewall(edge, "Firewall", {
      logging: FirewallLogging.toBucket(bucket),
    });

    const logsTemplate = Template.fromStack(logs);

    logsTemplate.hasResourceProperties("AWS::S3::Bucket", {
      BucketName: Match.stringLikeRegexp(
        "^aws-waf-logs-123456789012-eu-central-1-",
      ),
      LifecycleConfiguration: {
        Rules: [Match.objectLike({ ExpirationInDays: 7, Status: "Enabled" })],
      },
    });

    logsTemplate.hasResourceProperties("AWS::S3::BucketPolicy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Sid: "AWSLogDeliveryWrite",
            Principal: { Service: "delivery.logs.amazonaws.com" },
            Action: "s3:PutObject",
            Condition: {
              StringEquals: {
                "aws:SourceAccount": account,
                "s3:x-amz-acl": "bucket-owner-full-control",
              },
              ArnLike: { "aws:SourceArn": `arn:aws:logs:*:${account}:*` },
            },
          }),
          Match.objectLike({ Sid: "AWSLogDeliveryAclCheck" }),
        ]),
      },
    });

    const edgeTemplate = Template.fromStack(edge);

    edgeTemplate.resourceCountIs("AWS::Logs::LogGroup", 0);
    edgeTemplate.hasResourceProperties("AWS::WAFv2::LoggingConfiguration", {
      LogDestinationConfigs: [Match.anyValue()],
      LoggingFilter: Match.objectLike({ DefaultBehavior: "DROP" }),
    });
  });

  it("logs blocked and counted requests to a WAF log group when enabled", () => {
    const template = synthesize({
      logging: FirewallLogging.toLogGroup({
        retention: RetentionDays.ONE_WEEK,
      }),
    });

    template.hasResourceProperties("AWS::Logs::LogGroup", {
      LogGroupName: Match.stringLikeRegexp("^aws-waf-logs-"),
      RetentionInDays: 7,
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

  it("applies a rate limit when enabled", () => {
    expect(ruleNames(synthesize())).not.toContain("RateLimit");

    synthesize({ rateLimit: { limit: 3000 } }).hasResourceProperties(
      "AWS::WAFv2::WebACL",
      {
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
        ]),
      },
    );
  });

  it("overrides all rule actions to count in count mode", () => {
    const template = synthesize({
      mode: FirewallMode.COUNT,
      rateLimit: { limit: 3000 },
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
        ...Firewall.defaultManagedRuleGroups.map(() =>
          Match.objectLike({ OverrideAction: { Count: {} } }),
        ),
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

  it("imports an existing web ACL by its ARN", () => {
    const stack = new Stack(new App(), "Test", {
      env: { account: "123456789012", region: "eu-central-1" },
    });

    const webAclArn =
      "arn:aws:wafv2:us-east-1:123456789012:global/webacl/shared/abc";

    const firewall = Firewall.fromWebAclArn(stack, "Firewall", webAclArn);

    expect(firewall.webAclArn).toBe(webAclArn);
    Template.fromStack(stack).resourceCountIs("AWS::WAFv2::WebACL", 0);
  });
});
