# DockerCluster

This construct creates a load balanced Fargate service, for which it builds a Docker image from a local directory. A CloudFront distribution is connected to the load balancer.

```ts
new DockerCluster({
  path: "../my/directory", // Must contain a Dockerfile.
  port: 3000,
  cpu: 256,
  memory: 512,
  instances: 1,
  secrets: {
    foo: DockerBuildSecret.fromSrc("./foo"),
  },
});
```
