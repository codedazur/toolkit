# DockerCluster

This construct creates a load balanced Fargate service, for which it builds a Docker image from a local directory. A CloudFront distribution is connected to the load balancer.

```ts
new DockerCluster({
  path: "../../", // path to Docker build context
  file: "apps/myApp/DockerFile", // path to Dockerfile
  port: 3000,
  cpu: 1024, // 1vCPU
  memory: 4096, // 4GB
  tasks: { minimum: 1, maximum: 10 },
  secrets: {
    foo: DockerBuildSecret.fromSrc("./foo"),
  },
});
```
