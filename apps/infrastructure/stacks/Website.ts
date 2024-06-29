import { env } from "@codedazur/essentials";
import { App, Stack, StackProps } from "aws-cdk-lib";
import { ToolkitSite } from "../constructs/ToolkitSite";

export class Website extends Stack {
  constructor(scope?: App, id?: string, props?: StackProps) {
    super(scope, id, props);

    new ToolkitSite(this, "Website", {
      directory: "../website/out",
      subdomain: env("WEBSITE_SUBDOMAIN"),
    });
  }
}
