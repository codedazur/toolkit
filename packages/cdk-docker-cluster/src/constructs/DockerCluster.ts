import { CacheInvalidator } from "@codedazur/cdk-cache-invalidator";
import { Distribution, OriginProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { LoadBalancerV2Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { DockerImageAsset, Platform } from "aws-cdk-lib/aws-ecr-assets";
import { Cluster, ContainerImage } from "aws-cdk-lib/aws-ecs";
import {
  ApplicationLoadBalancedFargateService,
  ApplicationLoadBalancedFargateServiceProps,
} from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";

export interface DockerClusterProps {
  path: string;
  file?: string;
  arguments?: Record<string, string>;
  secrets?: Record<string, string>;
  port?: number;
  tasks?:
    | number
    | {
        minimum: number;
        maximum: number;
      };
  cpu?: ApplicationLoadBalancedFargateServiceProps["cpu"];
  memory?: ApplicationLoadBalancedFargateServiceProps["memoryLimitMiB"];
}

/**
 * An Docker cluster on a load balanced Fargate service on EC2, using an image
 * built from a Dockerfile in a directory and pushed to ECR.
 */
export class DockerCluster extends Construct {
  constructor(scope: Construct, id: string, props: DockerClusterProps) {
    super(scope, id);

    const image = new DockerImageAsset(this, "Image", {
      directory: props.path,
      file: props.file,
      exclude: ["**/cdk.out"],
      buildArgs: props.arguments,
      buildSecrets: props.secrets,
      platform: Platform.LINUX_AMD64,
    });

    const desiredTasks =
      typeof props.tasks === "number" ? props.tasks : props.tasks?.minimum;

    const fargate = new ApplicationLoadBalancedFargateService(this, "Service", {
      cluster: new Cluster(this, "Cluster"),
      cpu: props.cpu,
      memoryLimitMiB: props.memory,
      desiredCount: desiredTasks,
      taskImageOptions: {
        // image: ContainerImage.fromEcrRepository(image.repository, image.imageTag),
        image: ContainerImage.fromDockerImageAsset(image),
        containerPort: props.port,
      },
      circuitBreaker: {
        enable: true,
        rollback: true,
      },
      // @todo certificate: ...
      // @todo publicLoadBalancer: false,
    });

    if (typeof props.tasks === "object") {
      fargate.service.autoScaleTaskCount({
        minCapacity: props.tasks.minimum,
        maxCapacity: props.tasks.maximum,
      });
    }

    const distribution = new Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new LoadBalancerV2Origin(fargate.loadBalancer, {
          protocolPolicy: OriginProtocolPolicy.HTTP_ONLY, // @todo OriginProtocolPolicy.HTTPS_ONLY
        }),
      },
    });

    new CacheInvalidator(this, "CacheInvalidator", {
      distribution,
    });
  }
}
