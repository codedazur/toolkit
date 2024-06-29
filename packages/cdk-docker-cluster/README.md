# DockerCluster

This construct creates a load balanced Fargate service, for which it builds a Docker image from a local directory. A CloudFront distribution is connected to the load balancer.

## Examples

```ts
new DockerCluster({
  source: {
    path: "../../", // path to Docker build context
    file: "apps/myApp/DockerFile", // path to Dockerfile
    arguments: {
      MY_BUILD_ARGUMENT: "foo",
    },
    secrets: {
      myBuildSecret: DockerBuildSecret.fromSrc("./foo"),
    },
  },
  port: 3000,
  cpu: 1024, // 1vCPU
  memory: 4096, // 4GB
  tasks: {
    minimum: 1,
    maximum: 10,
  },
});
```

### From Tarball

```ts
new DockerCluster({
  source: ContainerImage.fromTarball("./path/to/image.tar"),
  // ...
});
```

### From Image Asset

```ts
new DockerCluster({
  source: ContainerImage.fromImageAsset(
    new DockerImageAsset(this, "ImageAsset", {
      // ...
    }),
  ),
  // ...
});
```
