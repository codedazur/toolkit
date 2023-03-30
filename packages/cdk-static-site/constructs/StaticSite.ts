import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  Distribution,
  Function as CloudFrontFunction,
  FunctionCode,
  FunctionEventType,
  OriginProtocolPolicy,
  PriceClass,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  ARecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
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
  };
}

/**
 * Static site infrastructure, which deploys site content to an S3 bucket.
 *
 * The site redirects from HTTP to HTTPS, using a CloudFront distribution,
 * Route53 alias record, and ACM certificate.
 */
export class StaticSite extends Construct {
  public readonly domain?: string;
  public readonly bucket: Bucket;
  public readonly zone?: IHostedZone;
  public readonly certificate?: DnsValidatedCertificate;
  public readonly functions: {
    viewerRequest?: CloudFrontFunction;
    viewerResponse?: CloudFrontFunction;
  };
  public readonly distribution: Distribution;
  public readonly alias?: ARecord;
  public readonly deployment: BucketDeployment;

  constructor(
    scope: Construct,
    id: string,
    protected readonly props: StaticSiteProps
  ) {
    super(scope, id);

    this.domain = this.determineDomain();
    this.bucket = this.createBucket();
    this.zone = this.findHostedZone();
    this.certificate = this.createCertificate();
    this.functions = this.createFunctions();
    this.distribution = this.createDistribution();
    this.alias = this.createAlias();
    this.deployment = this.createDeployment();
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

  protected createBucket() {
    const bucket = new Bucket(this, "Bucket", {
      publicReadAccess: true,
      websiteIndexDocument: this.props.website?.indexDocument ?? "index.html",
      websiteErrorDocument: this.props.website?.errorDocument ?? "error.html",
      transferAcceleration: this.props.bucket?.accelerate,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

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
      code: this.getMiddlewareCode(handlers),
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
      code: this.getMiddlewareCode(handlers),
    });
  }

  /**
   * @todo @bug The `complete` function should return `event.response` when it
   * is used as a viewerResponse function.
   */
  protected getMiddlewareCode(handlers: FunctionCode[]) {
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
				return event.request;
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
          ].join(":")
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
   * @todo Decide if and how we want to include this by default. What if someone
   * _does_ want their site to be loaded in an iFrame? We could add some
   * optional props of course, such as `distribution.xFrameOptions: string` or
   * something like that.
   */
  protected getSecurityHeadersCode() {
    return FunctionCode.fromInline(/* js */ `
			function securityHeaders(event, next) {
				event.response.headers["strict-transport-security"] = {
          value: "max-age=63072000; includeSubdomains; preload",
        };

        /**
         * @todo I believe this header is way too strict. Make it better.
         */
        // event.response.headers["content-security-policy"] = {
        //   value:
        //     "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'",
        // };

        event.response.headers["x-content-type-options"] = {
          value: "nosniff",
        };

        event.response.headers["x-frame-options"] = {
          value: "DENY",
        };

        event.response.headers["x-xss-protection"] = {
          value: "1; mode=block",
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
            new CloudFrontTarget(this.distribution)
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
      distribution: this.distribution,
      distributionPaths: this.props.deployment?.cacheInvalidations ?? ["/*"],
      memoryLimit: this.props.deployment?.memoryLimit,
    });
  }
}
