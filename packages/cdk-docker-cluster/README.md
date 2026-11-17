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

### Firewall

The distribution of a `DockerCluster` has an AWS WAF firewall by default, with a per-IP rate limit and AWS managed rule groups against common exploits. See the [Firewall](https://github.com/codedazur/toolkit/tree/main/packages/cdk-firewall) documentation for the exact rules.

Web ACLs for CloudFront must be created in `us-east-1`. If your stack is in another region, or has no explicit region, no firewall is created and synthesis shows a warning. In that case, deploy the stack to `us-east-1`, or create a web ACL in a separate `us-east-1` stack and attach it by its ARN.

```ts
new DockerCluster(this, "DockerCluster", {
  // ...
  distribution: {
    firewall: { webAclArn: "arn:aws:wafv2:us-east-1:..." },
  },
});
```

Configuration that you provide is merged with the defaults. For example, to only count matching requests while you evaluate the rules:

```ts
new DockerCluster(this, "DockerCluster", {
  // ...
  distribution: {
    firewall: { mode: "count" },
  },
});
```

To disable the firewall, set `firewall` to `false`.
