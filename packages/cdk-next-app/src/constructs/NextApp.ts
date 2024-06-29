import os from "os";
import path from "path";

import {
  DockerCluster,
  DockerClusterProps,
} from "@codedazur/cdk-docker-cluster";
import { DockerBuildSecret } from "aws-cdk-lib";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

export interface NextAppProps extends Omit<DockerClusterProps, "source"> {
  source: Exclude<DockerClusterProps["source"], ContainerImage>;
}

/**
 * A docker cluster preconfigured for running a Next.js application with support
 * for private NPM packages using a build-time secret.
 */
export class NextApp extends DockerCluster {
  constructor(
    scope: Construct,
    id: string,
    { port = 3000, source, ...props }: NextAppProps,
  ) {
    super(scope, id, {
      port,
      source: {
        ...source,
        secrets: {
          npmrc: DockerBuildSecret.fromSrc(path.join(os.homedir(), "/.npmrc")),
          ...source.secrets,
        },
      },
      ...props,
    });
  }
}
