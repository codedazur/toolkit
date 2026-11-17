# NextApp

The NextApp CDK construct deploys a standalone Next.js build to a load balanced Fargate service on AWS.

It automatically mounts the `~/.npmrc` file as a build secret for installation of private NPM packages.

## Prerequisites

### Next.js Configuration

Your `next.config.js` file needs to be configured for standalone output.

```js
// next.config.js
// ...
const nextConfig = {
  // ...
  output: "standalone",
};
// ...
```

### Docker

In order to use this construct, your Next.js application needs to be configured for Docker deployments. See the [official documentation](https://nextjs.org/docs/pages/building-your-application/deploying#docker-image) for more information.

## Example

### Standard Repository

For a non-monorepo build, simply provide the path to the directory that contains your Dockerfile.

```ts
new NextApp(this, "NextApp", {
  source: "../next",
});
```

### Monorepo

For monorepo builds, set the build context to the root of your monorepo, and provide the path to your Next.js module's Dockerfile.

```ts
new NextApp(this, "NextApp", {
  source: {
    directory: "../../",
    file: "apps/next/Dockerfile",
  },
});
```

### Arguments and Secrets

The NextApp is based on the [DockerCluster](https://github.com/codedazur/toolkit/tree/main/packages/cdk-docker-cluster) construct and supports all of its features related to Docker's build arguments and secrets.

These arguments and secrets need to be handled appropriately by your Dockerfile in order for them to have any effect.

```ts
import { DockerBuildSecret } from "aws-cdk-lib";

new NextApp(this, "NextApp", {
  source: {
    // ...
    arguments: {
      MY_BUILD_ARGUMENT: process.env.MY_BUILD_ARGUMENT,
    },
    secrets: {
      myBuildSecret: new DockerBuildSecret.fromEnvironment("MY_BUILD_SECRET"),
    },
  },
});
```

### Scaling

The NextApp is based on the [DockerCluster](https://github.com/codedazur/toolkit/tree/main/packages/cdk-docker-cluster) construct and supports all of its features for vertical scaling and horizontal (auto-)scaling.

```ts
new NextApp(this, "NextApp", {
  // ...
  service: {
    cpu: 1024,
    memory: 4096,
    tasks: 3,
  },
});
```

```ts
new NextApp(this, "NextApp", {
  // ...
  service: {
    // ...
    tasks: {
      minimum: 1,
      maximum: 5,
    },
  },
});
```

### Firewall

The distribution can be protected by an AWS WAF web ACL. The `NextAppFirewall` is a [Firewall](https://github.com/codedazur/toolkit/tree/main/packages/cdk-firewall) with additional rules for Next.js:

- Requests that carry the internal `x-middleware-subrequest` header are blocked. This header was used to bypass middleware, including authorization checks, in vulnerable Next.js versions ([CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927)).
- Static assets (`/_next/static/`) and optimized images (`/_next/image`) don't count towards the rate limit of 2000 requests per IP address per 5 minutes, because every page view requests many of them.

```ts
new NextApp(this, "NextApp", {
  // ...
  distribution: {
    firewall: new NextAppFirewall(this, "Firewall"),
  },
});
```

It accepts the same options as the `Firewall`. Custom `rules` are evaluated after the Next.js rules, and a custom `rateLimit` replaces the Next.js rate limit.

A firewall for CloudFront must be created in `us-east-1`. If your stack is in another region, see the [Firewall](https://github.com/codedazur/toolkit/tree/main/packages/cdk-firewall#regions) documentation for how to create it in a separate stack.
