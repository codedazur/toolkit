import { CacheInvalidator } from "@codedazur/cdk-cache-invalidator";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import {
  DnsValidatedCertificate,
  ICertificate,
} from "aws-cdk-lib/aws-certificatemanager";
import {
  Function as CloudFrontFunction,
  Distribution,
  FunctionCode,
  FunctionEventType,
  OriginProtocolPolicy,
  PriceClass,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { AnyPrincipal, Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import {
  ARecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export interface StaticSiteProps {
  path: string;
  authentication?: {
    username: string;
    password: string;
  };
  bucket?: {
    accelerate?: boolean;
  };
  domain?: {
    name: string;
    subdomain?: string;
    zone?: IHostedZone;
  };
  website?: {
    indexDocument?: string;
    errorDocument?: string;
  };
  distribution?: {
    priceClass?: PriceClass;
    functions?: {
      viewerRequest?: FunctionCode[];
      viewerResponse?: FunctionCode[];
    };
  };
  deployment?: {
    memoryLimit?: number;
    prefix?: string;
    cacheInvalidations?: string[];
    awaitCacheInvalidations?: boolean;
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
  public readonly domain?: string;
  public readonly refererSecret: Secret;
  public readonly bucket: Bucket;
  public readonly zone?: IHostedZone;
  public readonly certificate?: ICertificate;
  public readonly functions: {
    viewerRequest?: CloudFrontFunction;
    viewerResponse?: CloudFrontFunction;
  };
  public readonly distribution: Distribution;
  public readonly alias?: ARecord;
  public readonly deployment: BucketDeployment;
  public readonly cacheInvalidator?: CacheInvalidator;

  constructor(
    scope: Construct,
    id: string,
    protected readonly props: StaticSiteProps,
  ) {
    super(scope, id);

    this.domain = this.determineDomain();
    this.refererSecret = this.createRefererSecret();
    this.bucket = this.createBucket();
    this.zone = this.findHostedZone();
    this.certificate = this.createCertificate();
    this.functions = this.createFunctions();
    this.distribution = this.createDistribution();
    this.alias = this.createAlias();
    this.deployment = this.createDeployment();

    if (!props.deployment?.awaitCacheInvalidations) {
      this.cacheInvalidator = this.createCacheInvalidator();
    }
  }

  protected determineDomain() {
    const domain = this.props.domain
      ? [this.props.domain.subdomain, this.props.domain.name]
          .filter(Boolean)
          .join(".")
      : undefined;

    if (domain) {
      new CfnOutput(this, "URL", { value: "https://" + domain });
    }

    return domain;
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

  protected findHostedZone() {
    return this.props.domain
      ? this.props.domain?.zone ??
          HostedZone.fromLookup(this, "HostedZone", {
            domainName: this.props.domain.name,
          })
      : undefined;
  }

  protected createCertificate() {
    const certificate =
      this.domain && this.zone
        ? new DnsValidatedCertificate(this, "Certificate", {
            domainName: this.domain,
            hostedZone: this.zone,
            region: "us-east-1",
          })
        : undefined;

    if (certificate) {
      new CfnOutput(this, "CertificateArn", {
        value: certificate.certificateArn,
      });
    }

    return certificate;
  }

  protected createFunctions() {
    return {
      viewerRequest: this.createViewerRequestFunction(),
      viewerResponse: this.createViewerResponseFunction(),
    };
  }

  protected createViewerRequestFunction() {
    const handlers = [
      this.getAuthenticateCode(),
      this.getAppendSlashCode(),
      ...(this.props.distribution?.functions?.viewerRequest ?? []),
    ].filter((handler): handler is FunctionCode => !!handler);

    if (handlers.length === 0) {
      return undefined;
    }

    return new CloudFrontFunction(this, "ViewerRequestFunction", {
      code: this.getHandlerChainCode(handlers, "request"),
    });
  }

  protected createViewerResponseFunction() {
    const handlers = [
      this.getSecurityHeadersCode(),
      ...(this.props.distribution?.functions?.viewerResponse ?? []),
    ].filter((handler): handler is FunctionCode => !!handler);

    if (handlers.length === 0) {
      return undefined;
    }

    return new CloudFrontFunction(this, "ViewerResponseFunction", {
      code: this.getHandlerChainCode(handlers, "response"),
    });
  }

  protected getHandlerChainCode(
    handlers: FunctionCode[],
    completion: "request" | "response",
  ) {
    return FunctionCode.fromInline(/* js */ `
			function handler(event) {
				return chain(event, [
					${handlers.map((code) => code.render().replace(/;\s*$/, "")).join(",")}
				])
			}

			function chain(event, handlers) {
				var current = handlers.shift() ?? complete;
				return current(event, (event) => chain(event, handlers))
			}

			function complete(event) {
				return event.${completion};
			}
		`);
  }

  protected getAuthenticateCode() {
    const token = this.getAuthenticationToken();

    if (!token) {
      return;
    }

    return FunctionCode.fromInline(/* js */ `
			function authenticate(event, next) {
				var header = event.request.headers.authorization;
				var expected = "Basic ${token}";

				if (!header || header.value !== expected) {
					return {
						statusCode: 401,
						statusDescription: "Unauthorized",
						headers: {
							"www-authenticate": {
								value: "Basic",
							},
						},
					};
				}

				return next(event);
			}
		`);
  }

  protected getAuthenticationToken() {
    return this.props.authentication
      ? Buffer.from(
          [
            this.props.authentication?.username,
            this.props.authentication?.password,
          ].join(":"),
        ).toString("base64")
      : undefined;
  }

  protected getAppendSlashCode() {
    return FunctionCode.fromInline(/* js */ `
			function appendSlash(event, next) {
				if (
					!event.request.uri.endsWith("/") &&
					!event.request.uri.includes(".")
				) {
					event.request.uri += "/";
				}

				return next(event);
			}
		`);
  }

  /**
   * @todo Make these headers configurable.
   * @todo Research CSP and define a good default.
   */
  protected getSecurityHeadersCode() {
    return FunctionCode.fromInline(/* js */ `
			function securityHeaders(event, next) {
				event.response.headers["strict-transport-security"] = {
          value: "max-age=63072000; includeSubDomains; preload",
        };

        // event.response.headers["content-security-policy"] = {
        //   value:
        //     "default-src 'self'; img-src *; media-src *; frame-src *; font-src *
        // };

        event.response.headers["x-content-type-options"] = {
          value: "nosniff",
        };

        event.response.headers["x-frame-options"] = {
          value: "SAMEORIGIN",
        };

        return next(event);
			}
		`);
  }

  protected createDistribution() {
    const distribution = new Distribution(this, "Distribution", {
      priceClass: this.props.distribution?.priceClass,
      certificate: this.certificate,
      domainNames: this.domain ? [this.domain] : undefined,
      defaultBehavior: {
        origin: new HttpOrigin(this.bucket.bucketWebsiteDomainName, {
          protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
          customHeaders: {
            Referer: this.refererSecret.secretValue.toString(),
          },
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          ...(this.functions.viewerRequest
            ? [
                {
                  function: this.functions.viewerRequest,
                  eventType: FunctionEventType.VIEWER_REQUEST,
                },
              ]
            : []),
          ...(this.functions.viewerResponse
            ? [
                {
                  function: this.functions.viewerResponse,
                  eventType: FunctionEventType.VIEWER_RESPONSE,
                },
              ]
            : []),
        ],
      },
    });

    new CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    });

    new CfnOutput(this, "DistributionDomainName", {
      value: distribution.distributionDomainName,
    });

    return distribution;
  }

  protected createAlias() {
    return this.domain && this.zone
      ? new ARecord(this, "DomainAlias", {
          recordName: this.domain,
          target: RecordTarget.fromAlias(
            new CloudFrontTarget(this.distribution),
          ),
          zone: this.zone,
        })
      : undefined;
  }

  protected createDeployment() {
    return new BucketDeployment(this, "Deployment", {
      sources: [Source.asset(this.props.path)],
      destinationBucket: this.bucket,
      destinationKeyPrefix: this.props.deployment?.prefix,
      memoryLimit: this.props.deployment?.memoryLimit,
      distribution: this.props.deployment?.awaitCacheInvalidations
        ? this.distribution
        : undefined,
      distributionPaths: this.props.deployment?.cacheInvalidations,
    });
  }

  protected createCacheInvalidator() {
    return new CacheInvalidator(this, "CacheInvalidator", {
      distribution: this.distribution,
      paths: this.props.deployment?.cacheInvalidations ?? ["/*"],
    });
  }
}
