import {
  SiteDistribution,
  SiteDistributionProps,
} from "@codedazur/cdk-site-distribution";
import { App, Duration } from "aws-cdk-lib";
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
  ScalableTaskCount,
  Secret,
} from "aws-cdk-lib/aws-ecs";
import {
  ApplicationLoadBalancedFargateService,
  ApplicationLoadBalancedFargateServiceProps,
} from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";

export interface DockerClusterProps {
  readonly source: string | SourceProps | ContainerImage;
  readonly service?: ServiceProps;
  readonly distribution?: Omit<SiteDistributionProps, "origin">;
}

export interface ServiceProps {
  readonly port?: number;
  readonly tasks?: number | AutoScalingConfig;
  readonly cpu?: ApplicationLoadBalancedFargateServiceProps["cpu"];
  readonly memory?: ApplicationLoadBalancedFargateServiceProps["memoryLimitMiB"];
  readonly environment?: Record<string, string>;
  readonly secrets?: Record<string, Secret>;
}

interface AutoScalingConfig {
  /**
   * The minimum number of tasks to scale out to.
   */
  minimum: number;
  /**
   * The maximum number of tasks to scale out to.
   */
  maximum: number;
  threshold?: {
    /**
     * The memory utilization percentage above which the service will scale out.
     * @default 75
     */
    memory?: number;
    /**
     * The CPU utilization percentage above which the service will scale out.
     * @default 75
     */
    cpu?: number;
  };
  cooldown?: {
    /**
     * The cooldown period for scaling in.
     * @default Duration.seconds(300)
     */
    in?: Duration;
    /**
     * The cooldown period for scaling out.
     * @default Duration.seconds(300)
     */
    out?: Duration;
  };
}

interface SourceProps {
  readonly directory: string;
  readonly exclude?: string[];
  readonly file?: string;
  readonly arguments?: Record<string, string>;
  readonly secrets?: Record<string, string>;
}

/**
 * An Docker cluster on a load balanced Fargate service on EC2, using an image
 * built from a Dockerfile in a directory and pushed to ECR.
 * @todo Make the distribution and load balancer optional, to reduce cost and
 * increase deployment speed for development environments.
 */
export class DockerCluster extends Construct {
  public readonly domain?: string;
  public readonly image: ContainerImage;
  public readonly service: ApplicationLoadBalancedFargateService;
  public readonly autoScaling?: ScalableTaskCount;
  public readonly siteDistribution: SiteDistribution;

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
    this.autoScaling = this.createAutoScaling(this.service);
    this.siteDistribution = this.createSiteDistribution();
  }

  protected createImage(source: string | SourceProps) {
    const props: Partial<AssetImageProps> = {
      exclude: [`**/${this.getOutputDirectory()}`],
      platform: Platform.LINUX_AMD64,
      // networkMode: NetworkMode.HOST, // @todo Use the host network mode.
      // cacheFrom: [], // @todo Use the previously built image as a cache.
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

    return service;
  }

  protected createAutoScaling(service: ApplicationLoadBalancedFargateService) {
    if (typeof this.props.service?.tasks !== "object") {
      return;
    }

    const autoScaling = service.service.autoScaleTaskCount({
      minCapacity: this.props.service?.tasks.minimum,
      maxCapacity: this.props.service?.tasks.maximum,
    });

    autoScaling.scaleOnMemoryUtilization("MemoryScaling", {
      targetUtilizationPercent:
        this.props.service?.tasks.threshold?.memory ?? 75,
      scaleInCooldown: this.props.service?.tasks.cooldown?.in,
      scaleOutCooldown: this.props.service?.tasks.cooldown?.out,
    });

    autoScaling.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: this.props.service?.tasks.threshold?.cpu ?? 75,
      scaleInCooldown: this.props.service?.tasks.cooldown?.in,
      scaleOutCooldown: this.props.service?.tasks.cooldown?.out,
    });

    return autoScaling;
  }

  protected createSiteDistribution() {
    const { cachePolicy, originRequestPolicy, ...distribution } =
      this.props.distribution ?? {};

    return new SiteDistribution(this, "Distribution", {
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachePolicy: cachePolicy ?? this.createCachePolicy(),
      originRequestPolicy:
        originRequestPolicy ?? this.createOriginRequestPolicy(),
      ...distribution,
      origin: new LoadBalancerV2Origin(this.service.loadBalancer, {
        protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
      }),
    });
  }

  /**
   * The managed "UseOriginCacheControlHeaders-QueryStrings" cache policy, which
   * is designed for use with an origin that sends Cache-Control headers with
   * the object, which is recommended for use with an Application Load Balancer,
   * and includes query strings in the cache key.
   * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-origin-cache-headers-query-strings
   */
  protected createCachePolicy() {
    return CachePolicy.fromCachePolicyId(
      this,
      "CachePolicy",
      ManagedCachePolicyId.UseOriginCacheControlHeadersQueryStrings,
    );
  }

  /**
   * The managed "AllViewer" origin request policy, which includes all values
   * (query strings, headers, and cookies) in the viewer request, which is
   * recommended for use with an Application Load Balancer endpoint.
   * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html#managed-origin-request-policy-all-viewer
   */
  protected createOriginRequestPolicy() {
    return OriginRequestPolicy.fromOriginRequestPolicyId(
      this,
      "OriginRequestPolicy",
      ManagedOriginRequestPolicyId.AllViewer,
    );
  }

  protected getOutputDirectory() {
    return App.of(this)?.outdir ?? "cdk.out";
  }
}

enum ManagedCachePolicyId {
  UseOriginCacheControlHeadersQueryStrings = "4cc15a8a-d715-48a4-82b8-cc0b614638fe",
}

enum ManagedOriginRequestPolicyId {
  AllViewer = "216adef6-5c7f-47e4-b989-5492eafa07d3",
}
