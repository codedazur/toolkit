# DockerCluster

This construct creates a load balanced Fargate service, for which it builds a Docker image from a local directory. A CloudFront distribution is connected to the load balancer.

## Examples

The minimum needed to get a DockerCluster up and running is a path to the source directory that contains a Dockerfile, relative to the CDK app, and the port on which your container needs to be accessible.

```ts
new DockerCluster(this, "DockerCluster", {
  source: "../path/to/source",
  service: {
    port: 3000,
  },
});
```

### With Monorepo Build

If your Dockerfile is not located directly in the build context directory, which is common for monorepositories, you can provide the path to the Dockerfile relative to the source directory.

```ts
new DockerCluster({
  source: {
    directory: "../path/to/source",
    file: "./apps/myApp/DockerFile",
  },
  // ...
});
```

### With Arguments and Secrets

Additionally, if your Dockerfile requires arguments and/or secrets, you can provide those as well.

```ts
new DockerCluster({
  source: {
    // ...
    arguments: {
      MY_BUILD_ARGUMENT: "foo",
    },
    secrets: {
      myBuildSecret: DockerBuildSecret.fromSrc("./foo"),
    },
  },
  // ...
});
```

### With ContainerImage

Alternatively, you can provide your own `ContainerImage` instance. There are many ways to construct a `ContainerImage`. For example, you can create one from an asset and take full control over how CDK builds your Docker image.

```ts
new DockerCluster({
  source: ContainerImage.fromAsset("../path/to/source", {
    // ...
  }),
  // ...
});
```

Or, if you want to build your Docker image outside of CDK, you can create a `ContainerImage` from a path to your image's tarball.

```ts
new DockerCluster({
  source: ContainerImage.fromTarball("./path/to/image.tar"),
  // ...
});
```

Or if the image you need is published to a registry, you can create your
`ContainerImage` from a registry path. You can provide credentials in case the registry is private.

```ts
new DockerCluster({
  source: ContainerImage.fromRegistry("node:20"),
  // ...
});
```

Finally, you can create a `ContainerImage` from an image that you have published to an ECR repository.

```ts
new DockerCluster({
  source: ContainerImage.fromEcrRepository(myRespository, "my-tag"),
  // ...
});
```

### With Scaling

The `DockerCluster` construct supports both vertical and horizontal scaling.

```ts
new DockerCluster(this, "DockerCluster", {
  // ...
  service: {
    // ...
    cpu: 1024, // 1vCPU
    memory: 4096, // 4GB
    tasks: 3,
  },
});
```

Horizontal auto-scaling is also supported.

```ts
new DockerCluster(this, "DockerCluster", {
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
