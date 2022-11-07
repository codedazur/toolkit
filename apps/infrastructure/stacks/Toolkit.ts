import { StaticSite } from "@codedazur/cdk-static-site";
import { App, Stack, StackProps } from "aws-cdk-lib";
import { env } from "@codedazur/essentials";

export class Toolkit extends Stack {
  constructor(scope?: App, id?: string, props?: StackProps) {
    super(scope, id, props);

    new StaticSite(this, "Website", {
      path: "../website/out",
      domain: domain({
        subdomain: env("WEBSITE_SUBDOMAIN"),
      }),
    });

    new StaticSite(this, "Storybook", {
      path: "../storybook/.storybook",
      domain: domain({
        subdomain: env("STORYBOOK_SUBDOMAIN", "storybook"),
      }),
    });
  }
}

const domain = ({ subdomain }: { subdomain?: string }) => {
  return {
    name: env("DOMAIN_NAME", "toolkit.codedazur.cloud"),
    subdomain,
  };
};
