#!/usr/bin/env node

import { config as dotenv } from "dotenv";
dotenv();

import { App } from "aws-cdk-lib";
import { Website } from "./stacks/Website";
import { Storybook } from "./stacks/Storybook";

const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new Storybook(app, "ToolkitStorybook", { env });
new Website(app, "ToolkitWebsite", { env });
