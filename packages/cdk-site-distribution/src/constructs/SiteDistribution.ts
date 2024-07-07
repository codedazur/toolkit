import { CacheInvalidator } from "@codedazur/cdk-cache-invalidator";
import { CfnOutput } from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
  ICertificate,
} from "aws-cdk-lib/aws-certificatemanager";
import {
  Function as CloudFrontFunction,
  Distribution,
  FunctionCode,
  FunctionEventType,
  IOrigin,
  PriceClass,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import {
  ARecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export interface SiteDistributionProps {
  origin: IOrigin;
  priceClass?: PriceClass;
  functions?: {
    viewerRequest?: FunctionCode[];
    viewerResponse?: FunctionCode[];
  };
  authentication?: {
    username: string;
    password?: string | Secret;
  };
  domain?: {
    name: string;
    subdomain?: string;
    zone?: IHostedZone;
  };
  invalidateCache?: boolean | string[];
}

/**
 * @todo Make use of KeyValueStores for CloudFront functions to store the Basic
 * authentication password.
 */
export class SiteDistribution extends Construct {
  public readonly domain?: string;
  public readonly zone?: IHostedZone;
  public readonly certificate?: ICertificate;
  public readonly passwordSecret?: Secret;
  public readonly functions: {
    viewerRequest?: CloudFrontFunction;
    viewerResponse?: CloudFrontFunction;
  };
  public readonly distribution: Distribution;
  public readonly alias?: ARecord;
  public readonly cacheInvalidator?: CacheInvalidator;

  constructor(
    scope: Construct,
    id: string,
    protected readonly props: SiteDistributionProps,
  ) {
    super(scope, id);

    this.domain = this.determineDomain();
    this.zone = this.findHostedZone();
    this.certificate = this.createCertificate();

    if (this.props.authentication && !this.props.authentication.password) {
      this.passwordSecret = this.createPasswordSecret();
    }

    this.functions = this.createFunctions();
    this.distribution = this.createDistribution();
    this.alias = this.createAlias();

    if (props.invalidateCache ?? true) {
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
        ? new Certificate(this, "Certificate", {
            domainName: this.domain,
            validation: CertificateValidation.fromDns(this.zone),
          })
        : undefined;

    if (certificate) {
      new CfnOutput(this, "CertificateArn", {
        value: certificate.certificateArn,
      });
    }

    return certificate;
  }

  protected createPasswordSecret() {
    return new Secret(this, "PasswordSecret", {
      generateSecretString: { excludePunctuation: true },
    });
  }

  protected createFunctions() {
    const viewerRequest = this.createViewerRequestFunction();
    const viewerResponse = this.createViewerResponseFunction();

    /**
     * Although the response function doesn't actually depend on the request
     * function, we define a dependency to avoid a service rate limit that may
     * occur when both are created simultaneously.
     */
    if (viewerRequest && viewerResponse) {
      viewerResponse.node.addDependency(viewerRequest);
    }

    return {
      viewerRequest,
      viewerResponse,
    };
  }

  protected createViewerRequestFunction() {
    const handlers = [
      this.getAuthenticateCode(),
      ...(this.props.functions?.viewerRequest ?? []),
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
      ...(this.props.functions?.viewerResponse ?? []),
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
    if (!this.props.authentication) {
      return;
    }

    const token = this.getAuthenticationToken();

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
    const password = this.getPassword();

    if (!password) {
      return undefined;
    }

    return Buffer.from(
      [this.props.authentication?.username, password].join(":"),
    ).toString("base64");
  }

  protected getPassword() {
    if (!this.props.authentication?.password) {
      return this.passwordSecret?.secretValue.toString();
    }

    if (this.props.authentication.password instanceof Secret) {
      return this.props.authentication.password.secretValue.toString();
    }

    return this.props.authentication.password;
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
      priceClass: this.props.priceClass,
      certificate: this.certificate,
      domainNames: this.domain ? [this.domain] : undefined,
      defaultBehavior: {
        origin: this.props.origin,
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

  protected createCacheInvalidator() {
    const paths = Array.isArray(this.props.invalidateCache)
      ? this.props.invalidateCache
      : undefined;

    return new CacheInvalidator(this, "CacheInvalidator", {
      distribution: this.distribution,
      paths,
    });
  }
}
