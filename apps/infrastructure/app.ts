#!/usr/bin/env node

import { App } from "aws-cdk-lib";
import { Toolkit } from "./stacks/Toolkit";

const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new Toolkit(app, "Toolkit", { env });
