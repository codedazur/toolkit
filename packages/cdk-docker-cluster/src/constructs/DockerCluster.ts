import {
  Firewall,
  FirewallProps,
  SiteDistribution,
  SiteDistributionProps,
} from "@codedazur/cdk-site-distribution";
import { Annotations, App, Duration, Stack, Token } from "aws-cdk-lib";
import {
  AllowedMethods,
  CachePolicy,
  OriginProtocolPolicy,
  OriginRequestPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { VpcOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import {
  AssetImageProps,
  Cluster,
  ContainerImage,
  LogDriver,
  ScalableTaskCount,
  Secret,
} from "aws-cdk-lib/aws-ecs";
import {
  ApplicationLoadBalancedFargateService,
  ApplicationLoadBalancedFargateServiceProps,
} from "aws-cdk-lib/aws-ecs-patterns";
import { HealthCheck } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface ClusterConfig {
  /**
   * Enable CloudWatch Container Insights for the ECS Cluster.
   * @default false
   */
  readonly containerInsights?: boolean;
}

export interface DockerClusterProps {
  readonly source: string | SourceProps | ContainerImage;
  /**
   * Enable CloudWatch Container Insights for the ECS Cluster.
   * @default false
   */
  readonly containerInsights?: boolean;
  readonly service?: ServiceProps;
  /**
   * Configuration of the CloudFront distribution.
   *
   * Unlike the @see SiteDistribution itself, the distribution of a
   * DockerCluster has a firewall by default if the stack is deployed to
   * `us-east-1`, which is required for firewalls on CloudFront distributions.
   * In other regions, or if the region is unknown at synth time, no firewall is
   * created unless `firewall` is set explicitly. Set `firewall` to `false` to
   * disable it, or provide @see FirewallProps to extend the defaults.
   */
  readonly distribution?: Omit<SiteDistributionProps, "origin">;
  /**
   * @deprecated Use top-level `containerInsights` instead.
   */
  readonly cluster?: ClusterConfig;
}

export interface LoggingConfig {
  /**
   * The number of days log events are kept in CloudWatch Logs.
   */
  readonly retention?: RetentionDays;
}

export interface ServiceProps {
  readonly port?: number;
  readonly tasks?: number | AutoScalingConfig;
  readonly cpu?: ApplicationLoadBalancedFargateServiceProps["cpu"];
  readonly memory?: ApplicationLoadBalancedFargateServiceProps["memoryLimitMiB"];
  readonly environment?: Record<string, string>;
  readonly secrets?: Record<string, Secret>;
  /**
   * Health check configuration for the Application Load Balancer target group.
   */
  readonly healthCheck?: HealthCheck;
  /**
   * CloudWatch logging configuration for the container.
   */
  readonly logging?: LoggingConfig;
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

    /**
     * Give the target group of the private load balancer a new ID, so that
     * upgrading from a public load balancer does not fail. A target group can
     * only belong to one load balancer.
     */
    this.node.setContext("@aws-cdk/aws-ecs-patterns:uniqueTargetGroupId", true);

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

    const containerInsights =
      this.props.containerInsights ?? this.props.cluster?.containerInsights;

    const logDriver = this.props.service?.logging?.retention
      ? LogDriver.awsLogs({
          streamPrefix: this.node.id,
          logRetention: this.props.service.logging.retention,
        })
      : undefined;

    const service = new ApplicationLoadBalancedFargateService(this, "Service", {
      cluster: new Cluster(this, "Cluster", {
        containerInsights,
      }),
      publicLoadBalancer: false,
      cpu: this.props.service?.cpu,
      memoryLimitMiB: this.props.service?.memory,
      desiredCount: desiredTasks,
      taskImageOptions: {
        image: this.image,
        containerPort: this.props.service?.port,
        logDriver,
        environment: this.props.service?.environment,
        secrets: this.props.service?.secrets,
      },
      circuitBreaker: {
        enable: true,
        rollback: true,
      },
    });

    if (this.props.service?.healthCheck) {
      service.targetGroup.configureHealthCheck(this.props.service.healthCheck);
    }

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
      firewall: this.determineFirewall(),
      origin: VpcOrigin.withApplicationLoadBalancer(this.service.loadBalancer, {
        protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
      }),
    });
  }

  /**
   * Determines the firewall configuration for the distribution. A firewall is
   * enabled by default when the stack is known to be in `us-east-1`. Explicit
   * firewall configuration is merged with @see DockerCluster.defaultFirewall.
   */
  protected determineFirewall(): SiteDistributionProps["firewall"] {
    const firewall = this.props.distribution?.firewall;

    if (firewall === undefined) {
      const region = Stack.of(this).region;

      if (Token.isUnresolved(region) || region !== Firewall.region) {
        Annotations.of(this).addWarningV2(
          "@codedazur/cdk-docker-cluster:firewallDisabled",
          `No firewall was created for the distribution, because the stack ${Token.isUnresolved(region) ? "has no explicit region" : `is in ${region}`}. Firewalls for CloudFront distributions must be created in ${Firewall.region}. Set \`distribution.firewall\` explicitly to enable or disable it.`,
        );

        return false;
      }

      return this.defaultFirewall();
    }

    if (firewall === true) {
      return this.defaultFirewall();
    }

    if (firewall === false || "webAclArn" in firewall) {
      return firewall;
    }

    return { ...this.defaultFirewall(), ...firewall };
  }

  /**
   * The default firewall configuration, which subclasses can override to
   * tailor the firewall to a specific type of application.
   */
  protected defaultFirewall(): FirewallProps {
    return {};
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
