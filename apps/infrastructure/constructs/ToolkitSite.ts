import { StaticSite, StaticSiteProps } from "@codedazur/cdk-static-site";
import { env } from "@codedazur/essentials";
import { Construct } from "constructs";

interface ToolkitSiteProps extends Omit<StaticSiteProps, "domain"> {
  subdomain?: string;
}

export class ToolkitSite extends StaticSite {
  constructor(
    scope: Construct,
    id: string,
    { subdomain, ...props }: ToolkitSiteProps
  ) {
    super(scope, id, {
      ...props,
      domain: {
        name: env("DOMAIN_NAME", "toolkit.codedazur.cloud"),
        subdomain,
      },
    });
  }
}
