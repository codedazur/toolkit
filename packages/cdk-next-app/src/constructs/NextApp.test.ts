import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { describe, it } from "vitest";
import { NextApp } from "./NextApp";

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
});
