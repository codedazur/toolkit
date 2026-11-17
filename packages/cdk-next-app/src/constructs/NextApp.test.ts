import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { describe, it } from "vitest";
import { NextApp, NextAppProps } from "./NextApp";

describe("NextApp", () => {
  it("forwards top-level container insights configuration to the cluster", () => {
    const app = new App();
    const stack = new Stack(app, "Test");

    new NextApp(stack, "NextApp", {
      source: ContainerImage.fromRegistry("nginx:alpine"),
      containerInsights: true,
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::ECS::Cluster", {
      ClusterSettings: [
        {
          Name: "containerInsights",
          Value: "enabled",
        },
      ],
    });
  });

  it("forwards health check configuration to the target group", () => {
    const app = new App();
    const stack = new Stack(app, "Test");

    new NextApp(stack, "NextApp", {
      source: ContainerImage.fromRegistry("nginx:alpine"),
      service: {
        healthCheck: {
          path: "/api/health",
        },
      },
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::ElasticLoadBalancingV2::TargetGroup", {
      HealthCheckPath: "/api/health",
    });
  });

  it("forwards log retention configuration to the log group", () => {
    const app = new App();
    const stack = new Stack(app, "Test");

    new NextApp(stack, "NextApp", {
      source: ContainerImage.fromRegistry("nginx:alpine"),
      service: {
        logging: {
          retention: RetentionDays.ONE_WEEK,
        },
      },
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Logs::LogGroup", {
      RetentionInDays: 7,
    });
  });

  describe("firewall", () => {
    function synthesize(props: Partial<NextAppProps> = {}) {
      const app = new App();
      const stack = new Stack(app, "Test", {
        env: { account: "123456789012", region: "us-east-1" },
      });

      new NextApp(stack, "NextApp", {
        source: ContainerImage.fromRegistry("nginx:alpine"),
        ...props,
      });

      return Template.fromStack(stack);
    }

    it("applies Next.js specific rules by default", () => {
      const template = synthesize();

      template.hasResourceProperties("AWS::WAFv2::WebACL", {
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

    it("merges custom configuration with the Next.js defaults", () => {
      const template = synthesize({
        distribution: { firewall: { mode: "count" } },
      });

      template.hasResourceProperties("AWS::WAFv2::WebACL", {
        Rules: Match.arrayWith([
          Match.objectLike({
            Name: "NextMiddlewareSubrequest",
            Action: { Count: {} },
          }),
        ]),
      });
    });
  });
});
