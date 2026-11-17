import { App, Stack } from "aws-cdk-lib";
import { Annotations, Match, Template } from "aws-cdk-lib/assertions";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { describe, expect, it } from "vitest";
import { DockerCluster, DockerClusterProps } from "./DockerCluster";

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

  it("configures log retention when specified", () => {
    const app = new App();
    const stack = new Stack(app, "Test");

    new DockerCluster(stack, "DockerCluster", {
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

  it("only exposes the load balancer through the distribution", () => {
    const app = new App();
    const stack = new Stack(app, "Test");

    new DockerCluster(stack, "DockerCluster", {
      source: ContainerImage.fromRegistry("nginx:alpine"),
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties(
      "AWS::ElasticLoadBalancingV2::LoadBalancer",
      {
        Scheme: "internal",
      },
    );

    template.resourceCountIs("AWS::CloudFront::VpcOrigin", 1);

    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: {
        Origins: [Match.objectLike({ VpcOriginConfig: Match.anyValue() })],
      },
    });
  });

  it("gives the private load balancer a new target group", () => {
    const app = new App();
    const stack = new Stack(app, "Test");

    new DockerCluster(stack, "DockerCluster", {
      source: ContainerImage.fromRegistry("nginx:alpine"),
    });

    const targetGroups = Template.fromStack(stack).findResources(
      "AWS::ElasticLoadBalancingV2::TargetGroup",
    );

    expect(Object.keys(targetGroups)).toEqual([
      expect.stringContaining("ECSPrivate"),
    ]);
  });

  describe("firewall", () => {
    function synthesize(
      props: Partial<DockerClusterProps> = {},
      region?: string,
    ) {
      const app = new App();
      const stack = new Stack(app, "Test", {
        env: region ? { account: "123456789012", region } : undefined,
      });

      new DockerCluster(stack, "DockerCluster", {
        source: ContainerImage.fromRegistry("nginx:alpine"),
        ...props,
      });

      return { stack, template: Template.fromStack(stack) };
    }

    it("creates a firewall by default in us-east-1", () => {
      const { template } = synthesize({}, "us-east-1");

      template.resourceCountIs("AWS::WAFv2::WebACL", 1);
      template.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: Match.objectLike({ WebACLId: Match.anyValue() }),
      });
    });

    it.each([
      ["another region", "eu-west-1"],
      ["an unknown region", undefined],
    ])("warns and skips the firewall by default in %s", (_, region) => {
      const { stack, template } = synthesize({}, region);

      template.resourceCountIs("AWS::WAFv2::WebACL", 0);
      Annotations.fromStack(stack).hasWarning(
        "*",
        Match.stringLikeRegexp("No firewall was created"),
      );
    });

    it("can be disabled", () => {
      const { template } = synthesize(
        { distribution: { firewall: false } },
        "us-east-1",
      );

      template.resourceCountIs("AWS::WAFv2::WebACL", 0);
    });

    it("can be enabled explicitly when the region is unknown", () => {
      const { template } = synthesize({ distribution: { firewall: true } });

      template.resourceCountIs("AWS::WAFv2::WebACL", 1);
    });

    it("accepts an existing web ACL in any region", () => {
      const webAclArn =
        "arn:aws:wafv2:us-east-1:123456789012:global/webacl/shared/abc";

      const { template } = synthesize(
        { distribution: { firewall: { webAclArn } } },
        "eu-west-1",
      );

      template.resourceCountIs("AWS::WAFv2::WebACL", 0);
      template.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: Match.objectLike({ WebACLId: webAclArn }),
      });
    });

    it("passes firewall configuration through", () => {
      const { template } = synthesize(
        { distribution: { firewall: { mode: "count" } } },
        "us-east-1",
      );

      template.hasResourceProperties("AWS::WAFv2::WebACL", {
        Rules: Match.arrayWith([
          Match.objectLike({ Name: "RateLimit", Action: { Count: {} } }),
        ]),
      });
    });
  });
});
