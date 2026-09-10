import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { describe, it } from "vitest";
import { DockerCluster } from "./DockerCluster";

describe("DockerCluster", () => {
  it("creates a cluster without container insights by default", () => {
    const app = new App();
    const stack = new Stack(app, "Test");

    new DockerCluster(stack, "DockerCluster", {
      source: ContainerImage.fromRegistry("nginx:alpine"),
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::ECS::Cluster", {
      ClusterSettings: Match.absent(),
    });
  });

  it("enables container insights when configured at top level", () => {
    const app = new App();
    const stack = new Stack(app, "Test");

    new DockerCluster(stack, "DockerCluster", {
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

  it("enables container insights when configured under cluster config (backwards compatibility)", () => {
    const app = new App();
    const stack = new Stack(app, "Test");

    new DockerCluster(stack, "DockerCluster", {
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

  it("configures custom health check path when specified", () => {
    const app = new App();
    const stack = new Stack(app, "Test");

    new DockerCluster(stack, "DockerCluster", {
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
