import { CacheInvalidator } from "@codedazur/cdk-cache-invalidator";
import { revalueObject } from "@codedazur/essentials";
import { CfnOutput } from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
  ICertificate,
} from "aws-cdk-lib/aws-certificatemanager";
import {
  AllowedMethods,
  BehaviorOptions,
  Function as CloudFrontFunction,
  Distribution,
  FunctionCode,
  FunctionEventType,
  ICachePolicy,
  IOrigin,
  IOriginRequestPolicy,
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

export interface SiteDistributionProps extends BehaviorProps {
  priceClass?: PriceClass;
  domain?: {
    name: string;
    subdomain?: string;
    zone?: IHostedZone;
  };
  behaviors?: Record<string, Partial<BehaviorProps>>;
  invalidateCache?: boolean | string[];
}

export interface BehaviorProps {
  origin: IOrigin;
  authentication?:
    | {
        username: string;
        password: string;
      }
    | false;
  functions?: {
    viewerRequest?: FunctionCode[];
    viewerResponse?: FunctionCode[];
  };
  allowedMethods?: AllowedMethods;
  cachePolicy?: ICachePolicy;
  originRequestPolicy?: IOriginRequestPolicy;
}

/**
 * @todo Make use of KeyValueStores for CloudFront functions to store the Basic
 * authentication password.
 */
export class SiteDistribution extends Construct {
  public readonly domain?: string;
  public readonly zone?: IHostedZone;
  public readonly certificate?: ICertificate;
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

  protected createDistribution() {
    const distribution = new Distribution(this, "Distribution", {
      priceClass: this.props.priceClass,
      certificate: this.certificate,
      domainNames: this.domain ? [this.domain] : undefined,
      defaultBehavior: this.behavior(),
      additionalBehaviors: this.props.behaviors
        ? revalueObject(this.props.behaviors, ([pattern, props]) =>
            this.behavior({ pattern, ...props }),
          )
        : undefined,
    });

    new CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    });

    new CfnOutput(this, "DistributionDomainName", {
      value: distribution.distributionDomainName,
    });

    return distribution;
  }

  protected behavior({
    pattern = "/*",
    authentication,
    functions: functionsCode,
    ...props
  }: Partial<BehaviorProps> & {
    pattern?: string;
  } = {}): BehaviorOptions {
    const functions = this.createFunctions({
      idSuffix: pattern,
      authentication: authentication ?? this.props.authentication,
      functions: functionsCode ?? this.props.functions,
    });

    return {
      origin: props.origin ?? this.props.origin,
      allowedMethods: props.allowedMethods ?? this.props.allowedMethods,
      originRequestPolicy:
        props.originRequestPolicy ?? this.props.originRequestPolicy,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: props.cachePolicy ?? this.props.cachePolicy,
      functionAssociations: [
        functions.viewerRequest
          ? {
              function: functions.viewerRequest,
              eventType: FunctionEventType.VIEWER_REQUEST,
            }
          : null,
        functions.viewerResponse
          ? {
              function: functions.viewerResponse,
              eventType: FunctionEventType.VIEWER_RESPONSE,
            }
          : null,
      ].filter((association) => !!association),
    };
  }

  protected createFunctions({
    idSuffix,
    authentication,
    functions,
  }: {
    idSuffix: string;
  } & Partial<Pick<BehaviorProps, "authentication" | "functions">>) {
    const viewerRequest = this.createViewerRequestFunction({
      id: `ViewerRequestFunction-${idSuffix}`,
      authentication,
      code: functions?.viewerRequest,
    });

    const viewerResponse = this.createViewerResponseFunction({
      id: `ViewerResponseFunction-${idSuffix}`,
      code: functions?.viewerResponse,
    });

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

  protected createViewerRequestFunction({
    id,
    authentication,
    code = [],
  }: {
    id: string;
    authentication?: BehaviorProps["authentication"];
    code?: FunctionCode[];
  }) {
    const handlers = [this.getAuthenticateCode(authentication), ...code].filter(
      (handler) => !!handler,
    );

    if (handlers.length === 0) {
      return undefined;
    }

    return new CloudFrontFunction(this, id, {
      code: this.getHandlerChainCode(handlers, "request"),
    });
  }

  protected createViewerResponseFunction({
    id,
    code = [],
  }: {
    id: string;
    code?: FunctionCode[];
  }) {
    const handlers = [this.getSecurityHeadersCode(), ...code].filter(
      (handler) => !!handler,
    );

    if (handlers.length === 0) {
      return undefined;
    }

    return new CloudFrontFunction(this, id, {
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

  protected getAuthenticateCode(props: BehaviorProps["authentication"]) {
    if (!props) {
      return;
    }

    const { username, password } = props;

    const token = Buffer.from(`${username}:${password}`).toString("base64");

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

  /**
   * @todo Make these headers configurable.
   * @todo Research CSP and define a good default.
   * @todo Enable customizable X-Frame-Options.
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

        // event.response.headers["x-frame-options"] = {
        //   value: "SAMEORIGIN",
        // };

        return next(event);
			}
		`);
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
