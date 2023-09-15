import {
  RestApi,
  RestApiProps,
  EndpointType,
  IResource,
  LambdaIntegration,
  SecurityPolicy,
} from "aws-cdk-lib/aws-apigateway";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { HttpMethod, IFunction } from "aws-cdk-lib/aws-lambda";
import {
  ARecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { ApiGateway } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

export interface RpcApiProps extends RestApiProps {
  procedures: Record<string, ProcedureProps>;
  domain?: DomainProps;
}

interface DomainProps {
  name: string;
  subdomain?: string;
}

interface ProcedureProps {
  method?: HttpMethod;
  handler?: IFunction;
  procedures?: Record<string, ProcedureProps>;
}

/**
 * A construct to create a Remote Procedure Call API on API Gateway.
 *
 * @example
 * new RpcApi(this, "MyRpcApi", {
 *   procedures: {
 *     helloWorld: {
 *       method: HttpMethod.GET,
 *       handler: helloWorldHandler,
 *     },
 *     search: {
 *       method: HttpMethod.GET,
 *       handler: searchHandler,
 *       procedures: {
 *         createIndex: {
 *           method: HttpMethod.POST,
 *           handler: createIndexHandler,
 *         },
 *         flushIndex: {
 *           method: HttpMethod.DELETE,
 *           handler: flushIndexHandler,
 *         },
 *       },
 *     },
 *   },
 * });
 */
export class RpcApi extends RestApi {
  constructor(
    scope: Construct,
    id: string,
    { procedures: endpoints, ...props }: RpcApiProps,
  ) {
    super(scope, id, props);

    this.createProcedures(this.root, endpoints);
    this.createDomain(props.domain);
  }

  protected createProcedures(
    parent: IResource,
    children: Record<string, ProcedureProps>,
  ) {
    Object.entries(children).forEach(([slug, child]) =>
      this.createProcedure(parent, slug, child),
    );
  }

  protected createProcedure(
    parent: IResource,
    slug: string,
    { method, handler, procedures: endpoints }: ProcedureProps,
  ) {
    const resource = parent.addResource(slug, {
      defaultIntegration:
        handler && !method ? new LambdaIntegration(handler) : undefined,
    });

    if (handler && method) {
      resource.addMethod(method, new LambdaIntegration(handler));
    }

    if (endpoints) {
      this.createProcedures(resource, endpoints);
    }
  }

  protected createDomain(domain?: DomainProps) {
    if (!domain) {
      return;
    }

    const zone = this.findHostedZone(domain);
    const certificate = this.createCertificate(domain, zone);

    this.addDomainName("Domain", {
      domainName: this.fqdn(domain),
      endpointType: EndpointType.EDGE,
      securityPolicy: SecurityPolicy.TLS_1_2,
      certificate,
    });

    this.createAlias(domain, zone);
  }

  protected findHostedZone(domain: DomainProps) {
    return HostedZone.fromLookup(this, "HostedZone", {
      domainName: domain.name,
    });
  }

  protected createCertificate(domain: DomainProps, zone: IHostedZone) {
    return new DnsValidatedCertificate(this, "Certificate", {
      domainName: this.fqdn(domain),
      hostedZone: zone,
      region: "us-east-1",
    });
  }

  protected createAlias(domain: DomainProps, zone: IHostedZone) {
    return domain && zone
      ? new ARecord(this, "DomainAlias", {
          recordName: this.fqdn(domain),
          target: RecordTarget.fromAlias(new ApiGateway(this)),
          zone: zone,
        })
      : undefined;
  }

  protected fqdn(domain: DomainProps) {
    return [domain.subdomain, domain.name].filter(Boolean).join(".");
  }
}
