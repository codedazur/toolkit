import { StaticSite } from "@codedazur/cdk-constructs";
import { App, Stack, StackProps } from "aws-cdk-lib";

export class Toolkit extends Stack {
  constructor(scope?: App, id?: string, props?: StackProps) {
    super(scope, id, props);

    new StaticSite(this, "StorybookSite", {
      path: "../storybook/.storybook",
      domain: {
        name: process.env.DOMAIN_NAME ?? "thijsdaniels.codedazur.cloud",
        subdomain: "storybook.toolkit",
      },
    });
  }
}
