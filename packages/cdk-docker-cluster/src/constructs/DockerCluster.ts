import {
  SiteDistribution,
  SiteDistributionProps,
} from "@codedazur/cdk-site-distribution";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { OriginProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { LoadBalancerV2Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { DockerImageAsset, Platform } from "aws-cdk-lib/aws-ecr-assets";
import { Cluster, ContainerImage } from "aws-cdk-lib/aws-ecs";
import {
  ApplicationLoadBalancedFargateService,
  ApplicationLoadBalancedFargateServiceProps,
} from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";

export interface DockerClusterProps {
  source: ContainerImage | DockerBuildProps;
  port?: number;
  tasks?:
    | number
    | {
        minimum: number;
        maximum: number;
      };
  cpu?: ApplicationLoadBalancedFargateServiceProps["cpu"];
  memory?: ApplicationLoadBalancedFargateServiceProps["memoryLimitMiB"];
  distribution?: Omit<SiteDistributionProps, "origin">;
}

interface DockerBuildProps {
  path: string;
  file?: string;
  arguments?: Record<string, string>;
  secrets?: Record<string, string>;
}

/**
 * An Docker cluster on a load balanced Fargate service on EC2, using an image
 * built from a Dockerfile in a directory and pushed to ECR.
 */
export class DockerCluster extends Construct {
  public readonly domain?: string;
  public readonly image: ContainerImage;
  public readonly service: ApplicationLoadBalancedFargateService;
  public readonly distribution: SiteDistribution;

  constructor(
    scope: Construct,
    id: string,
    protected readonly props: DockerClusterProps,
  ) {
    super(scope, id);

    this.image =
      this.props.source instanceof ContainerImage
        ? this.props.source
        : this.createImage();

    this.service = this.createService();
    this.distribution = this.createDistribution();
  }

  protected createImage() {
    const props = this.props.source as DockerBuildProps;

    const asset = new DockerImageAsset(this, "Image", {
      directory: props.path,
      file: props.file,
      exclude: ["**/cdk.out"],
      buildArgs: props.arguments,
      buildSecrets: props.secrets,
      platform: Platform.LINUX_AMD64,
    });

    return ContainerImage.fromDockerImageAsset(asset);
  }

  protected createService() {
    const desiredTasks =
      typeof this.props.tasks === "number"
        ? this.props.tasks
        : this.props.tasks?.minimum;

    const service = new ApplicationLoadBalancedFargateService(this, "Service", {
      cluster: new Cluster(this, "Cluster"),
      cpu: this.props.cpu,
      memoryLimitMiB: this.props.memory,
      desiredCount: desiredTasks,
      taskImageOptions: {
        // image: ContainerImage.fromEcrRepository(image.repository, image.imageTag),
        image: this.image,
        containerPort: this.props.port,
      },
      circuitBreaker: {
        enable: true,
        rollback: true,
      },
      publicLoadBalancer: false,
      certificate: new Certificate(this, "Certificate", {
        domainName: "example.com",
      }),
    });

    if (typeof this.props.tasks === "object") {
      this.service.service.autoScaleTaskCount({
        minCapacity: this.props.tasks.minimum,
        maxCapacity: this.props.tasks.maximum,
      });
    }

    return service;
  }

  protected createDistribution() {
    return new SiteDistribution(this, "Distribution", {
      ...this.props.distribution,
      origin: new LoadBalancerV2Origin(this.service.loadBalancer, {
        protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
      }),
    });
  }
}
