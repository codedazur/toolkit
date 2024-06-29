import {
  SiteDistribution,
  SiteDistributionProps,
} from "@codedazur/cdk-site-distribution";
import { App } from "aws-cdk-lib";
import { OriginProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { LoadBalancerV2Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import { AssetImageProps, Cluster, ContainerImage } from "aws-cdk-lib/aws-ecs";
import {
  ApplicationLoadBalancedFargateService,
  ApplicationLoadBalancedFargateServiceProps,
} from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";

export interface DockerClusterProps {
  source: string | SourceProps | ContainerImage;
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

interface SourceProps {
  directory: string;
  exclude?: string[];
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
        : this.createImage(this.props.source);

    this.service = this.createService();
    this.distribution = this.createDistribution();
  }

  protected createImage(source: string | SourceProps) {
    const props: Partial<AssetImageProps> = {
      exclude: [`**/${this.getOutputDirectory()}`],
      platform: Platform.LINUX_AMD64,
    };

    if (typeof source === "string") {
      return ContainerImage.fromAsset(source, props);
    }

    return ContainerImage.fromAsset(source.directory, {
      ...props,
      file: source.file,
      buildArgs: source.arguments,
      buildSecrets: source.secrets,
    });
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
        image: this.image,
        containerPort: this.props.port,
      },
      circuitBreaker: {
        enable: true,
        rollback: true,
      },
      publicLoadBalancer: false,
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

  protected getOutputDirectory() {
    return App.of(this)?.outdir ?? "cdk.out";
  }
}
