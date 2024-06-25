# NextApp

The NextApp CDK construct deploys a standalone Next.js build to a load balanced Fargate service on AWS.

## Example

### Standard Repository

For a non-mnonorepo build, simply provide the path to the directory that contains your Dockerfile.

```ts
new NextApp(this, "NextApp", {
  path: "../next",
});
```

### Monorepo

For monorepo builds, set the build context to the root of your monorepo, and provide the path to your Next.js module's Dockerfile.

```ts
new NextApp(this, "NextApp", {
  path: "../../",
  file: "apps/next/Dockerfile",
});
```

### Scaling

The NextApp is based on the [DockerCluster](https://github.com/codedazur/toolkit/tree/main/packages/cdk-docker-cluster) construct and supports all of its features for horizontal and vertical scaling.

```ts
new NextApp(this, "NextApp", {
  ...
  cpu: 1024,
  memory: 4096,
  tasks: { min: 1, max: 10 },
});
```

## Docker

In order to use this construct, your Next.js application needs to be configure for Docker deployments. See the [official documentation](https://nextjs.org/docs/pages/building-your-application/deploying#docker-image) for more information.
