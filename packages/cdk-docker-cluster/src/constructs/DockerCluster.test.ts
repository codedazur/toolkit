import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { describe, expect, it } from "vitest";
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

  describe("load balancer", () => {
    it("is internal and only reachable through CloudFront by default", () => {
      const app = new App();
      const stack = new Stack(app, "Test");

      new DockerCluster(stack, "DockerCluster", {
        source: ContainerImage.fromRegistry("nginx:alpine"),
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties(
        "AWS::ElasticLoadBalancingV2::LoadBalancer",
        { Scheme: "internal" },
      );

      template.hasResourceProperties("AWS::CloudFront::VpcOrigin", {
        VpcOriginEndpointConfig: {
          Arn: {
            Ref: Match.stringLikeRegexp("DockerClusterPrivateLoadBalancer"),
          },
          OriginProtocolPolicy: "http-only",
        },
      });

      template.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: {
          Origins: [
            Match.objectLike({
              VpcOriginConfig: {
                VpcOriginId: {
                  "Fn::GetAtt": [Match.stringLikeRegexp("VpcOrigin"), "Id"],
                },
              },
            }),
          ],
        },
      });
    });

    it("only allows inbound traffic from the CloudFront origin-facing prefix list by default", () => {
      const app = new App();
      const stack = new Stack(app, "Test");

      new DockerCluster(stack, "DockerCluster", {
        source: ContainerImage.fromRegistry("nginx:alpine"),
      });

      const template = Template.fromStack(stack);

      const lookups = Object.values(template.findResources("Custom::AWS"));

      expect(lookups).toHaveLength(1);
      expect(JSON.stringify(lookups[0].Properties.Create)).toContain(
        "describeManagedPrefixLists",
      );
      expect(JSON.stringify(lookups[0].Properties.Create)).toContain(
        "com.amazonaws.global.cloudfront.origin-facing",
      );

      template.hasResourceProperties("AWS::EC2::SecurityGroupIngress", {
        FromPort: 80,
        ToPort: 80,
        SourcePrefixListId: {
          "Fn::GetAtt": [
            Match.stringLikeRegexp("CloudFrontOriginFacingPrefixList"),
            "PrefixLists.0.PrefixListId",
          ],
        },
      });

      const loadBalancerSecurityGroups = template.findResources(
        "AWS::EC2::SecurityGroup",
        {
          Properties: {
            GroupDescription: Match.stringLikeRegexp("ELB"),
          },
        },
      );

      expect(Object.keys(loadBalancerSecurityGroups)).toHaveLength(1);

      for (const securityGroup of Object.values(loadBalancerSecurityGroups)) {
        expect(securityGroup.Properties.SecurityGroupIngress).toBeUndefined();
      }

      expect(
        template.findResources("AWS::EC2::SecurityGroupIngress", {
          Properties: { CidrIp: "0.0.0.0/0" },
        }),
      ).toEqual({});
    });

    it("is internet-facing with a regular origin when publicLoadBalancer is true", () => {
      const app = new App();
      const stack = new Stack(app, "Test");

      new DockerCluster(stack, "DockerCluster", {
        source: ContainerImage.fromRegistry("nginx:alpine"),
        service: {
          publicLoadBalancer: true,
        },
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties(
        "AWS::ElasticLoadBalancingV2::LoadBalancer",
        { Scheme: "internet-facing" },
      );

      template.resourceCountIs("AWS::CloudFront::VpcOrigin", 0);
      template.resourceCountIs("Custom::AWS", 0);

      template.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: {
          Origins: [
            Match.objectLike({
              CustomOriginConfig: Match.objectLike({
                OriginProtocolPolicy: "http-only",
              }),
            }),
          ],
        },
      });
    });
  });
});
