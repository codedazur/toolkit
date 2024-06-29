import { StaticSite } from "@codedazur/cdk-static-site";
import { env } from "@codedazur/essentials";
import { Construct } from "constructs";

interface ToolkitSiteProps {
  directory: string;
  subdomain?: string;
}

export class ToolkitSite extends StaticSite {
  constructor(
    scope: Construct,
    id: string,
    { directory, subdomain }: ToolkitSiteProps,
  ) {
    super(scope, id, {
      source: directory,
      distribution: {
        domain: {
          name: env("DOMAIN_NAME", "toolkit.codedazur.cloud"),
          subdomain,
        },
      },
    });
  }
}
