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
  ErrorResponse,
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
  /**
   * The price class for the distribution. This will affect the number of edge
   * locations used by the distribution.
   *
   * @default PriceClass.PRICE_CLASS_ALL
   */
  priceClass?: PriceClass;

  /**
   * The domain of the distribution. You can provide a single domain or an array
   * of domains. If you provide your own certificate, all domains need to be
   * covered by the certificate.
   */
  domain?: Domain | Domain[];

  /**
   * The hosted zone of the domain. If not provided, the hosted zone will be
   * looked up using the provided domain. If multiple domains are provided, the
   * first one will be used.
   */
  hostedZone?: IHostedZone;

  /**
   * The certificate to use for the distribution. If not provided, a certificate
   * will be created for the domain. If multiple domains are provided, the first
   * will be used as the primary domain and the others as subject alternative
   * names.
   */
  certificate?: ICertificate;

  /**
   * Any additional behaviors to add to the distribution, keyed by the path
   * pattern. These additional behaviors will inherit the properties of the
   * distribution.
   *
   * @default {}
   */
  behaviors?: Record<string, Partial<BehaviorProps>>;

  /**
   * Custom error responses to add to the distribution.
   *
   * @default []
   */
  errorResponses?: ErrorResponse[];

  /**
   * Whether to invalidate the cache after deployment. If set to `true`, the
   * entire cache will be invalidated. If set to an array of strings, only the
   * specified paths will be invalidated.
   *
   * @default true
   */
  invalidateCache?: boolean | string[];
}

export interface BehaviorProps {
  /**
   * The origin that the behavior will route traffic to.
   */
  origin: IOrigin;

  /**
   * The Baasic authentication credentials to use for the behavior. If set to
   * `false`, no authentication will be used.
   */
  authentication?:
    | {
        username: string;
        password: string;
      }
    | false;

  /**
   * Custom functions to run on the viewer request and response. The functions
   * will be chained together using a middleware pattern and will run in the
   * order they are provided.
   */
  functions?: {
    viewerRequest?: FunctionCode[];
    viewerResponse?: FunctionCode[];
  };

  /**
   * The allowed HTTP methods for the behavior.
   */
  allowedMethods?: AllowedMethods;

  /**
   * The cache policy to use for the behavior.
   */
  cachePolicy?: ICachePolicy;

  /**
   * The origin request policy to use for the behavior.
   */
  originRequestPolicy?: IOriginRequestPolicy;
}

export interface Domain {
  name: string;
  subdomain?: string;
}

/**
 * A construct that creates a general-purpose CloudFront distribution.
 *
 * One or more domains can be provided if needed, in which case a hosted zone
 * will be looked up and a certificate will be created and validated. You can
 * also provide your own hosted zone and certificate if needed, but make sure
 * the certificate covers all the domains.
 *
 * You can enable Basic authentication for the distribution and you can provide
 * custom functions to run on the viewer request and response. The functions
 * will be chained together using a middleware pattern and will run in the order
 * they are provided.
 *
 * The @see SiteDistributionProps extends @see BehaviorProps for the
 * configuration of the default behavior. Additional behaviors can be provided
 * as well, keyed by their path pattern and following the same props. These
 * additional behaviors will inherit the properties of the default behavior.
 *
 * You can provide custom error responses to add to the distribution, in case
 * you want to override CloudFront's default plaintext error responses.
 *
 * After successful deployment, the distribution's cache will be invalidated by
 * default. You can disable this behavior or provide an array of paths to
 * invalidate. The invalidation will not be awaited, so it will not block the
 * deployment.
 *
 * @todo Make use of KeyValueStores for CloudFront functions to store the Basic
 * authentication password.
 */
export class SiteDistribution extends Construct {
  public readonly domains?: string[];
  public readonly zone?: IHostedZone;
  public readonly certificate?: ICertificate;
  public readonly distribution: Distribution;
  public readonly functions: CloudFrontFunction[] = [];
  public readonly aliases?: ARecord[];
  public readonly cacheInvalidator?: CacheInvalidator;

  constructor(
    scope: Construct,
    id: string,
    protected readonly props: SiteDistributionProps,
  ) {
    super(scope, id);

    this.domains = this.determineDomains();
    this.zone = this.findHostedZone();
    this.certificate = this.createCertificate();
    this.distribution = this.createDistribution();
    this.aliases = this.createAliases();

    if (props.invalidateCache ?? true) {
      this.cacheInvalidator = this.createCacheInvalidator();
    }
  }

  protected determineDomains() {
    if (!this.props.domain) {
      return [];
    }

    const domainsProps = Array.isArray(this.props.domain)
      ? this.props.domain
      : [this.props.domain];

    const domains = domainsProps.map(({ name, subdomain }) =>
      [subdomain, name].filter(Boolean).join("."),
    );

    new CfnOutput(this, "URL", { value: "https://" + domains[0] });

    return domains;
  }

  protected getPrimaryDomain(): Domain | undefined {
    if (Array.isArray(this.props.domain)) {
      return this.props.domain[0];
    } else {
      return this.props.domain;
    }
  }

  protected getAlternateDomains(): Domain[] {
    if (Array.isArray(this.props.domain)) {
      return this.props.domain.slice(1);
    } else {
      return [];
    }
  }

  protected findHostedZone() {
    if (this.props.hostedZone) {
      return this.props.hostedZone;
    }

    const primaryDomain = this.getPrimaryDomain();

    return primaryDomain
      ? HostedZone.fromLookup(this, "HostedZone", {
          domainName: primaryDomain.name,
        })
      : undefined;
  }

  protected fqdn(domain: Domain) {
    return [domain.subdomain, domain.name].filter(Boolean).join(".");
  }

  protected createCertificate() {
    if (this.props.certificate) {
      return this.props.certificate;
    }

    const primaryDomain = this.getPrimaryDomain();
    const alternateDomains = this.getAlternateDomains();

    const certificate =
      primaryDomain && this.zone
        ? new Certificate(this, "Certificate", {
            domainName: this.fqdn(primaryDomain),
            subjectAlternativeNames: alternateDomains.map(this.fqdn),
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
      domainNames:
        this.domains && this.domains.length > 0 ? this.domains : undefined,
      defaultBehavior: this.behavior(),
      errorResponses: this.props.errorResponses,
      additionalBehaviors: this.props.behaviors
        ? revalueObject(this.props.behaviors, ([pattern, props]) =>
            this.behavior({ pattern, ...props }),
          )
        : undefined,
    });

    this.avoidFunctionRateLimit();

    new CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    });

    new CfnOutput(this, "DistributionDomainName", {
      value: distribution.distributionDomainName,
    });

    return distribution;
  }

  /**
   * Ddefines dependencies on functions to avoid a service rate limit that may
   * occur when several are created simultaneously.
   */
  private avoidFunctionRateLimit() {
    if (this.functions.length > 1) {
      for (let i = 1; i < this.functions.length; i++) {
        const a = this.functions[i - 1];
        const b = this.functions[i];
        a.node.addDependency(b);
      }
    }
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

    const func = new CloudFrontFunction(this, id, {
      code: this.getHandlerChainCode(handlers, "request"),
    });

    this.functions.push(func);

    return func;
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

    const func = new CloudFrontFunction(this, id, {
      code: this.getHandlerChainCode(handlers, "response"),
    });

    this.functions.push(func);

    return func;
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

  protected createAliases() {
    const domains = this.domains;
    const zone = this.zone;

    if (!domains || !zone) {
      return undefined;
    }

    return domains.map(
      (domain) =>
        new ARecord(this, `DomainAlias-${domain}`, {
          recordName: domain,
          target: RecordTarget.fromAlias(
            new CloudFrontTarget(this.distribution),
          ),
          zone,
        }),
    );
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
