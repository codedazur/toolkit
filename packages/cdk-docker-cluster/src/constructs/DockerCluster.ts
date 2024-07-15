import {
  SiteDistribution,
  SiteDistributionProps,
} from "@codedazur/cdk-site-distribution";
import { App } from "aws-cdk-lib";
import {
  AllowedMethods,
  CachePolicy,
  OriginProtocolPolicy,
  OriginRequestPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { LoadBalancerV2Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import {
  AssetImageProps,
  Cluster,
  ContainerImage,
  Secret,
} from "aws-cdk-lib/aws-ecs";
import {
  ApplicationLoadBalancedFargateService,
  ApplicationLoadBalancedFargateServiceProps,
} from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";

export interface DockerClusterProps {
  source: string | SourceProps | ContainerImage;
  service?: {
    port?: number;
    tasks?:
      | number
      | {
          minimum: number;
          maximum: number;
        };
    cpu?: ApplicationLoadBalancedFargateServiceProps["cpu"];
    memory?: ApplicationLoadBalancedFargateServiceProps["memoryLimitMiB"];
    environment?: Record<string, string>;
    secrets?: Record<string, Secret>;
  };
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
      typeof this.props.service?.tasks === "number"
        ? this.props.service?.tasks
        : this.props.service?.tasks?.minimum;

    const service = new ApplicationLoadBalancedFargateService(this, "Service", {
      cluster: new Cluster(this, "Cluster"),
      cpu: this.props.service?.cpu,
      memoryLimitMiB: this.props.service?.memory,
      desiredCount: desiredTasks,
      taskImageOptions: {
        image: this.image,
        containerPort: this.props.service?.port,
        environment: this.props.service?.environment,
        secrets: this.props.service?.secrets,
      },
      circuitBreaker: {
        enable: true,
        rollback: true,
      },
    });

    if (typeof this.props.service?.tasks === "object") {
      this.service.service.autoScaleTaskCount({
        minCapacity: this.props.service?.tasks.minimum,
        maxCapacity: this.props.service?.tasks.maximum,
      });
    }

    return service;
  }

  protected createDistribution() {
    /**
     * This retrieves the managed "UseOriginCacheControlHeaders-QueryStrings"
     * cache policy, which is designed for use with an origin that sends
     * Cache-Control headers with the object, which is recommended for use with
     * an Application Load Balancer, and includes query strings in the cache
     * key.
     */
    const cachePolicy = CachePolicy.fromCachePolicyId(
      this,
      "CachePolicy",
      "4cc15a8a-d715-48a4-82b8-cc0b614638fe",
    );

    /**
     * This retrieves the managed "AllViewer" origin request policy, which
     * includes all values (query strings, headers, and cookies) in the viewer
     * request, which is recommended for use with an Application Load Balancer
     * endpoint.
     */
    const originRequestPolicy = OriginRequestPolicy.fromOriginRequestPolicyId(
      this,
      "OriginRequestPolicy",
      "216adef6-5c7f-47e4-b989-5492eafa07d3",
    );

    return new SiteDistribution(this, "Distribution", {
      ...this.props.distribution,
      origin: new LoadBalancerV2Origin(this.service.loadBalancer, {
        protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
      }),
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachePolicy,
      originRequestPolicy,
    });
  }

  protected getOutputDirectory() {
    return App.of(this)?.outdir ?? "cdk.out";
  }
}
