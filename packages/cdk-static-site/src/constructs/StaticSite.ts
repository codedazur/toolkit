import {
  SiteDistribution,
  SiteDistributionProps,
} from "@codedazur/cdk-site-distribution";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import {
  FunctionCode,
  OriginProtocolPolicy,
  OriginRequestPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export enum RewriteMode {
  /**
   * Interpret ambiguous requests, as well as directory paths, as requests to
   * the root index.
   *
   * @example
   * - `/foo` -> `/index.html`
   * - `/foo/` -> `/index.html`
   * - `/foo.png` -> `/foo.png`
   */
  SinglePage = "SinglePage",

  /**
   * Interpret ambiguous requests as file paths and rewrite them to that file.
   *
   * @example
   * - `/foo` -> `/foo.html`
   * - `/foo/` -> `/foo/index.html`
   * - `/foo.png` -> `/foo.png`
   */
  NamedPages = "NamedPages",

  /**
   * Interpret ambiguous requests as directory paths and rewrite them to that
   * directory's `index.html` file.
   *
   * @example
   * - `/foo` -> `/foo/index.html`
   * - `/foo/` -> `/foo/index.html`
   * - `/foo.png` -> `/foo.png`
   */
  IndexPages = "IndexPages",
}

export interface StaticSiteProps {
  /**
   * The source directory to deploy to the bucket. You can either pass a string
   * path to a directory, or an object with a `directory` property and an
   * optional `exclude` property.
   */
  source:
    | string
    | {
        directory: string;
        exclude?: string[];
      };

  /**
   * The bucket to deploy the source to.
   */
  bucket?: {
    accelerate?: boolean;
  };

  /**
   * The StaticSite rewrites request URIs to direct traffic to the correct
   * document locations. Different strategies are available for different use
   * cases.
   *
   * @see RewriteMode
   * @default @see RewriteMode.IndexPages
   */
  rewriteMode?: RewriteMode;

  /**
   * The path to the error document that CloudFront will return when a request
   * is not found, or fails for other reasons.
   *
   * @default "error.html"
   */
  errorDocument?: string;

  /**
   * The CloudFront distribution to use for the site.
   *
   * @see SiteDistributionProps
   */
  distribution?: Omit<SiteDistributionProps, "origin">;

  /**
   * The deployment configuration includes the memory limit for the function
   * that is used to deploy the content to the bucket, and an optional prefix
   * that allows you to deploy the content to a subdirectory of the bucket.
   */
  deployment?: {
    memoryLimit?: number;
    prefix?: string;
  };
}

/**
 * Static site infrastructure, which deploys site content to an S3 bucket.
 *
 * The site redirects from HTTP to HTTPS, using a CloudFront distribution,
 * Route53 alias record, and ACM certificate.
 *
 * Direct read access to the bucket is disallowed unless a secret Referer header
 * is included in the request. This makes the bucket website inaccessible to the
 * public, while still allowing access by the CloudFront distribution, which is
 * configured to include that secret header.
 * @see https://repost.aws/knowledge-center/cloudfront-serve-static-website
 *
 * @todo Make the distribution optional, to reduce cost and increase deployment
 * speed for development environments.
 */
export class StaticSite extends Construct {
  public readonly refererSecret: Secret;
  public readonly bucket: Bucket;
  public readonly deployment: BucketDeployment;
  public readonly siteDistribution: SiteDistribution;

  constructor(
    scope: Construct,
    id: string,
    protected readonly props: StaticSiteProps,
  ) {
    super(scope, id);

    this.refererSecret = this.createRefererSecret();
    this.bucket = this.createBucket();
    this.siteDistribution = this.createSiteDistribution();
    this.deployment = this.createDeployment();
  }

  protected createRefererSecret(): Secret {
    return new Secret(this, "RefererSecret", {
      generateSecretString: { excludePunctuation: true },
    });
  }

  protected createBucket(): Bucket {
    const bucket = new Bucket(this, "Bucket", {
      publicReadAccess: true,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),
      websiteIndexDocument: "index.html",
      websiteErrorDocument: this.props.errorDocument ?? "error.html",
      transferAcceleration: this.props.bucket?.accelerate,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    bucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        conditions: {
          StringNotLike: {
            "aws:Referer": this.refererSecret.secretValue.toString(),
          },
        },
      }),
    );

    new CfnOutput(this, "BucketName", { value: bucket.bucketName });

    return bucket;
  }

  protected createSiteDistribution(): SiteDistribution {
    return new SiteDistribution(this, "SiteDistribution", {
      ...this.props.distribution,
      origin: new HttpOrigin(this.bucket.bucketWebsiteDomainName, {
        protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
        customHeaders: {
          Referer: this.refererSecret.secretValue.toString(),
        },
      }),
      originRequestPolicy: OriginRequestPolicy.CORS_S3_ORIGIN,
      functions: {
        viewerRequest: [
          this.getRewriteCode(),
          ...(this.props.distribution?.functions?.viewerRequest ?? []),
        ],
        ...this.props.distribution?.functions,
      },
    });
  }

  protected getRewriteCode(): FunctionCode {
    switch (this.props.rewriteMode) {
      case RewriteMode.SinglePage:
        return this.getSinglePageRewriteCode();
      case RewriteMode.NamedPages:
        return this.getNamedPagesRewriteCode();
      case RewriteMode.IndexPages:
      default:
        return this.getIndexPagesRewriteCode();
    }
  }

  protected getIndexPagesRewriteCode(): FunctionCode {
    return this.getAppendSlashCode();
  }

  /**
   * @deprecated Use `getIndexPagesRewriteCode` instead.
   */
  protected getAppendSlashCode(): FunctionCode {
    return FunctionCode.fromInline(/* js */ `
			function rewriteToIndexPage(event, next) {
				if (
					!event.request.uri.endsWith("/") &&
					!event.request.uri.includes(".")
				) {
					event.request.uri += "/index.html";
				}

				return next(event);
			}
		`);
  }

  protected getNamedPagesRewriteCode(): FunctionCode {
    return FunctionCode.fromInline(/* js */ `
      function rewriteToNamedPage(event, next) {
        if (
          !event.request.uri.endsWith("/") &&
          !event.request.uri.includes(".")
        ) {
          event.request.uri += ".html";
        }

        return next(event);
      }
    `);
  }

  protected getSinglePageRewriteCode(): FunctionCode {
    return FunctionCode.fromInline(/* js */ `
      function rewriteToRootIndex(event, next) {
        if (!event.request.uri.includes(".")) {
          event.request.uri = "/index.html";
        }

        return next(event);
      }
    `);
  }

  protected createDeployment(): BucketDeployment {
    return new BucketDeployment(this, "BucketDeployment", {
      sources: [
        typeof this.props.source === "string"
          ? Source.asset(this.props.source)
          : Source.asset(this.props.source.directory, {
              exclude: this.props.source.exclude,
            }),
      ],
      destinationBucket: this.bucket,
      destinationKeyPrefix: this.props.deployment?.prefix,
      memoryLimit: this.props.deployment?.memoryLimit,
    });
  }
}
