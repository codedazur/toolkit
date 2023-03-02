import { StaticSite } from "@codedazur/cdk-static-site";
import { App, Stack, StackProps } from "aws-cdk-lib";
import { env } from "@codedazur/essentials";
import { ToolkitSite } from "../constructs/ToolkitSite";

export class Storybook extends Stack {
  constructor(scope?: App, id?: string, props?: StackProps) {
    super(scope, id, props);

    new ToolkitSite(this, "Storybook", {
      path: "../storybook/.storybook",
      subdomain: env("STORYBOOK_SUBDOMAIN", "storybook"),
    });
  }
}
