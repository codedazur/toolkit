import os from "os";
import path from "path";

import {
  DockerCluster,
  DockerClusterProps,
} from "@codedazur/cdk-docker-cluster";
import { DockerBuildSecret } from "aws-cdk-lib";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

export interface NextAppProps extends DockerClusterProps {}

/**
 * A docker cluster preconfigured for running a Next.js application with support
 * for private NPM packages using a build-time secret.
 *
 * @todo Add specific distribution behaviors for the various Next.js features.
 * @see https://bitbucket.org/codedazur/cdk-constructs/src/v5.14.0/src/NextSite/NextSite.ts
 */
export class NextApp extends DockerCluster {
  constructor(
    scope: Construct,
    id: string,
    {
      source,
      service: { port = 3000, ...service } = {},
      distribution,
      ...props
    }: NextAppProps,
  ) {
    super(scope, id, {
      source: NextApp.withNpmSecret(source),
      ...props,
      service: {
        port,
        ...service,
      },
      distribution: {
        ...distribution,
        behaviors: {
          ...distribution?.behaviors,
          "/api/*": {
            authentication: false,
            ...distribution?.behaviors?.["/api/*"],
          },
        },
      },
    });
  }

  protected static withNpmSecret(source: NextAppProps["source"]) {
    if (source instanceof ContainerImage) {
      return source;
    }

    if (typeof source === "string") {
      return {
        directory: source,
        secrets: {
          npmrc: NextApp.npmSecret(),
        },
      };
    }

    return {
      ...source,
      secrets: {
        npmrc: NextApp.npmSecret(),
        ...source.secrets,
      },
    };
  }

  protected static npmSecret() {
    return DockerBuildSecret.fromSrc(path.join(os.homedir(), ".npmrc"));
  }
}
