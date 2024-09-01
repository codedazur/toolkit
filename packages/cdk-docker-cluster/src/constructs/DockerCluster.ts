import {
  SiteDistribution,
  SiteDistributionProps,
} from "@codedazur/cdk-site-distribution";
import { App } from "aws-cdk-lib";
import {
  AllowedMethods,
  OriginProtocolPolicy,
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
 * @todo Make the distribution and laod balancer optional, to reduce cost and
 * increase deployment speed for development environments.
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
    return new SiteDistribution(this, "Distribution", {
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachePolicy: {
        /**
         * The managed "UseOriginCacheControlHeaders-QueryStrings" cache policy,
         * which is designed for use with an origin that sends Cache-Control
         * headers with the object, which is recommended for use with an
         * Application Load Balancer, and includes query strings in the cache
         * key.
         * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-origin-cache-headers-query-strings
         */
        cachePolicyId: "4cc15a8a-d715-48a4-82b8-cc0b614638fe",
      },
      originRequestPolicy: {
        /**
         * The managed "AllViewer" origin request policy, which includes all
         * values (query strings, headers, and cookies) in the viewer request,
         * which is recommended for use with an Application Load Balancer
         * endpoint.
         * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html#managed-origin-request-policy-all-viewer
         */
        originRequestPolicyId: "216adef6-5c7f-47e4-b989-5492eafa07d3",
      },
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
