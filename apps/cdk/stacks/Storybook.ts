import { env } from "@codedazur/essentials";
import { App, Stack, StackProps } from "aws-cdk-lib";
import { ToolkitSite } from "../constructs/ToolkitSite";

export class Storybook extends Stack {
  constructor(scope?: App, id?: string, props?: StackProps) {
    super(scope, id, props);

    new ToolkitSite(this, "Storybook", {
      directory: "../storybook/.storybook",
      subdomain: env("STORYBOOK_SUBDOMAIN", "storybook"),
    });
  }
}
