import { StaticSite } from "@codedazur/cdk-constructs";
import { App, Stack, StackProps } from "aws-cdk-lib";
import { env } from "@codedazur/essentials";

export class Toolkit extends Stack {
  constructor(scope?: App, id?: string, props?: StackProps) {
    super(scope, id, props);

    new StaticSite(this, "Website", {
      path: "../website/out",
      domain: subdomain("toolkit"),
    });

    new StaticSite(this, "Storybook", {
      path: "../storybook/.storybook",
      domain: subdomain("storybook.toolkit"),
    });
  }
}

function subdomain(subdomain: string): { name: string; subdomain: string } {
  return {
    name: env("DOMAIN_NAME", "codedazur.cloud"),
    subdomain,
  };
}
