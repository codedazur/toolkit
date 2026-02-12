import { StaticSite } from "@codedazur/cdk-static-site";
import { env } from "@codedazur/essentials";
import { App, Stack, StackProps } from "aws-cdk-lib";
import { HostedZone } from "aws-cdk-lib/aws-route53";

const DOMAIN_NAME = env("DOMAIN_NAME", "toolkit.codedazur.cloud");
const STORYBOOK_SUBDOMAIN = env("STORYBOOK_SUBDOMAIN", "storybook");

export class Storybook extends Stack {
  constructor(scope?: App, id?: string, props?: StackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, "HostedZone", {
      domainName: DOMAIN_NAME,
    });

    new StaticSite(this, "Storybook", {
      source: "../storybook/.storybook",
      distribution: {
        domain: `${STORYBOOK_SUBDOMAIN}.${DOMAIN_NAME}`,
        hostedZone,
      },
      deployment: {
        memoryLimit: 256,
      },
    });
  }
}
