import {
  SiteDistribution,
  SiteDistributionProps,
} from "@codedazur/cdk-site-distribution";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { OriginProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export interface StaticSiteProps {
  source: {
    directory: string;
  };
  bucket?: {
    accelerate?: boolean;
  };
  website?: {
    indexDocument?: string;
    errorDocument?: string;
  };
  distribution?: Omit<SiteDistributionProps, "origin">;
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

  protected createRefererSecret() {
    return new Secret(this, "RefererSecret", {
      generateSecretString: { excludePunctuation: true },
    });
  }

  protected createBucket() {
    const bucket = new Bucket(this, "Bucket", {
      publicReadAccess: true,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),
      websiteIndexDocument: this.props.website?.indexDocument ?? "index.html",
      websiteErrorDocument: this.props.website?.errorDocument ?? "404.html",
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

  protected createSiteDistribution() {
    return new SiteDistribution(this, "SiteDistribution", {
      ...this.props.distribution,
      origin: new HttpOrigin(this.bucket.bucketWebsiteDomainName, {
        protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
        customHeaders: {
          Referer: this.refererSecret.secretValue.toString(),
        },
      }),
    });
  }

  protected createDeployment() {
    return new BucketDeployment(this, "BucketDeployment", {
      sources: [Source.asset(this.props.source.directory)],
      destinationBucket: this.bucket,
      destinationKeyPrefix: this.props.deployment?.prefix,
      memoryLimit: this.props.deployment?.memoryLimit,
    });
  }
}
