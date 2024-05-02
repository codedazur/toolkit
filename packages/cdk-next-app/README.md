# NextApp

The NextApp CDK construct deploys a standalone Next.js build to a load balanced Fargate service on AWS.

## Example

```ts
new NextApp(this, "Next", {
  path: "../next", // Must contain a Dockerfile.
});
```

## Docker

In order to use this construct, your Next.js application needs to be configure for Docker deployments. See the [official documentation](https://nextjs.org/docs/pages/building-your-application/deploying#docker-image) for more information.
