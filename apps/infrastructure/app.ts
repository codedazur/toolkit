#!/usr/bin/env node

import { App } from "aws-cdk-lib";
import * as dotenv from "dotenv";
import { Website } from "./stacks/Website";
import { Storybook } from "./stacks/Storybook";

dotenv.config();

const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new Storybook(app, "Toolkit", { env });
new Website(app, "Toolkit", { env });
