import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { describe, it } from "vitest";
import { NextApp } from "./NextApp";

describe("NextApp", () => {
  it("forwards container insights configuration to the cluster", () => {
    const app = new App();
    const stack = new Stack(app, "Test");

    new NextApp(stack, "NextApp", {
      source: ContainerImage.fromRegistry("nginx:alpine"),
      cluster: {
        containerInsights: true,
      },
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
});
