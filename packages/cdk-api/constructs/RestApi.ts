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

export interface ApiProps extends RestApiProps {
  endpoints: Record<string, ResourceProps>;
  domain?: DomainProps;
}

interface DomainProps {
  name: string;
  subdomain?: string;
}

interface ResourceProps {
  method?: HttpMethod;
  handler?: IFunction;
  endpoints?: Record<string, ResourceProps>;
}

export class Api extends RestApi {
  constructor(scope: Construct, id: string, { endpoints, ...props }: ApiProps) {
    super(scope, id, props);

    this.createEndpoints(this.root, endpoints);
    this.createDomain(props.domain);
  }

  protected createEndpoints(
    parent: IResource,
    children: Record<string, ResourceProps>,
  ) {
    Object.entries(children).forEach(([slug, child]) =>
      this.createEndpoint(parent, slug, child),
    );
  }

  protected createEndpoint(
    parent: IResource,
    slug: string,
    { method, handler, endpoints }: ResourceProps,
  ) {
    const resource = parent.addResource(slug, {
      defaultIntegration:
        handler && !method ? new LambdaIntegration(handler) : undefined,
    });

    if (handler && method) {
      resource.addMethod(method, new LambdaIntegration(handler));
    }

    if (endpoints) {
      this.createEndpoints(resource, endpoints);
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
