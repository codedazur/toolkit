# DockerCluster

This construct creates a load balanced Fargate service, for which it builds a Docker image from a local directory. A CloudFront distribution is connected to the load balancer.

The load balancer is internal and connected to the distribution as a [VPC origin](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-vpc-origins.html), so it can only be reached through CloudFront. See [Load Balancer Access](#load-balancer-access) for details.

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

### Load Balancer Access

By default, the load balancer is placed in the VPC's private subnets and connected to the CloudFront distribution as a VPC origin. Its security group only accepts HTTP traffic from the `com.amazonaws.global.cloudfront.origin-facing` managed prefix list, which is looked up at deploy time. This makes CloudFront the single point of entry, so its authentication, security headers, caching and firewall cannot be bypassed by sending requests to the load balancer directly.

VPC origins are [not available in every region and availability zone](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-vpc-origins.html#vpc-origins-supported-regions), and do not support gRPC or Lambda@Edge origin request and origin response triggers. If you need any of those, you can opt out and use an internet-facing load balancer instead. Note that it then accepts HTTP traffic from anywhere, so requests sent to its DNS name bypass the distribution.

```ts
new DockerCluster(this, "DockerCluster", {
  // ...
  service: {
    // ...
    publicLoadBalancer: true,
  },
});
```
