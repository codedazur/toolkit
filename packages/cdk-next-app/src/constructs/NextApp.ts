import os from "os";
import path from "path";

import {
  DockerCluster,
  DockerClusterProps,
} from "@codedazur/cdk-docker-cluster";
import { DockerBuildSecret } from "aws-cdk-lib";
import { AllowedMethods, CachePolicy } from "aws-cdk-lib/aws-cloudfront";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

export interface NextAppProps extends DockerClusterProps {}

/**
 * A docker cluster preconfigured for running a Next.js application with support
 * for private NPM packages using a build-time secret.
 *
 * @todo Document and standardize a shared cache pool for Next.js applications
 * that run on multiple containers.
 * @see https://nextjs.org/docs/app/guides/self-hosting#configuring-caching
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

          /**
           * API routes should not be cached by the CDN.
           * @see https://nextjs.org/docs/app/guides/self-hosting#usage-with-cdns
           */
          "/api/*": {
            authentication: false,
            allowedMethods: AllowedMethods.ALLOW_ALL,
            cachePolicy: CachePolicy.CACHING_DISABLED,
            ...distribution?.behaviors?.["/api/*"],
          },

          /**
           * Statically generated assets with hashes in the filename. These can
           * be cached forever.
           * @see https://nextjs.org/docs/app/guides/self-hosting#automatic-caching
           */
          "/_next/static/*": {
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            cachePolicy: CachePolicy.CACHING_OPTIMIZED,
            ...distribution?.behaviors?.["/_next/static/*"],
          },

          /**
           * Assets for Next.js Image Optimization. Caching is based on query
           * strings. This behavior inherits the default cache policy from the
           * DockerCluster, which should be configured to include query
           * strings in the cache key.
           * @see https://nextjs.org/docs/app/guides/self-hosting#image-optimization
           */
          "/_next/image*": {
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            ...distribution?.behaviors?.["/_next/image*"],
          },

          /**
           * Page data for client-side navigation. Caching should be aligned
           * with the corresponding page. This behavior inherits the default
           * cache policy, which should respect the origin's Cache-Control
           * headers.
           * @see https://nextjs.org/docs/app/guides/self-hosting#caching-and-isr
           */
          "/_next/data/*": {
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            ...distribution?.behaviors?.["/_next/data/*"],
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
