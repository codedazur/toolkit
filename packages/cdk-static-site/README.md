# CDK Static Site

The minimum needed to get a `StaticSite` up and running is to provide the path to the directory that you want to deploy as your website.

```ts
new StaticSite({
  source: "./path/to/build/output",
});
```

## Rewrite Modes

The `StaticSite` construct provides a few different rewrite modes to handle different use cases.

### None

This rewrite mode disables URI rewriting entirely. Requests are passed through to the bucket as-is.

```ts
new StaticSite({
  source: "./path/to/build/output",
  rewriteMode: RewriteMode.None,
});
```

### Index Pages (Default)

This is the default rewrite mode. It assumes that ambiguous requests are directory paths and rewrites them to that directory's `index.html` file.

```ts
new StaticSite({
  source: "./path/to/build/output",
  rewriteMode: RewriteMode.IndexPages,
});
```

Use this mode when your site's document structure looks like this:

```
/
├── index.html
├── about/
│   └── index.html
└── products/
    ├── index.html
    ├── product-1/
    │   └── index.html
    └── product-2/
        └── index.html
```

### Named Pages

This rewrite mode assumes that ambiguous requests are file paths and rewrites them to that file.

```ts
new StaticSite({
  source: "./path/to/build/output",
  rewriteMode: RewriteMode.NamedPages,
});
```

Use this mode when your site's document structure looks like this:

```
/
├── index.html
├── about.html
├── products.html
└── products/
    ├── product-1.html
    └── product-2.html
```

### Single Page

This rewrite mode will rewrite all page requests (requests that do not end with a file extension) to the root index.

```ts
new StaticSite({
  source: "./path/to/build/output",
  rewriteMode: RewriteMode.SinglePage,
});
```

Use this mode when your site's document structure looks like this:

```
/
└── index.html
```

In this scenario, any routing logic is expected to be handled by the application itself on the client side.

## With Excludes

If your output directory contains files you don't want to include in the deployment, you can exclude those with glob patterns.

```ts
new StaticSite({
  source: {
    directory: "./path/to/build/output",
    exclude: ["foo/*"],
  },
});
```

## With Custom Domain Name

If we have ownership over the domain name, or if the client is happy to forward all traffic on the top-level domain to us using an NS record, you can configure a custom domain name together with a HostedZone. The StaticSite will create the necessary certificates and the A-records in the provided HostedZone. You can either create the HostedZone using CDK, or you can create it manually in the Route53 service and refer to it in CDK using `HostedZone.fromLookup()` or `HostedZone.fromHostedZoneId()`.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  distribution: {
    domain: "example.com",
    hostedZone: new HostedZone(this, "HostedZone", {
      zoneName: "example.com",
    }),
  },
});
```

If we do not own the domain name and the client wants to keep control over the domain's DNS configuration, you won't be able to use a HostedZone. Instead, you should create a certificate in Certificate Manager service and have it validated by the client's DNS, and then refer to that certificate in your StaticSite. The StaticSite won't be able to configure the DNS records either, so the client will also have to set up the CNAME or A record to point to your CloudFront distribution.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  distribution: {
    domain: "example.com",
    certificate: Certificate.fromCertificateArn(this, Certificate, "..."),
  },
});
```

## With Basic Authentication

If you do not provide a password, a Secrets Manager secret will be created and its secret value used to verify the Authorization header using a CloudFront function. Keep in mind that editing the secret's value will not update the CloudFront function.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  distribution: {
    authentication: {
      username: "username",
    },
  },
});
```

You can also provide your own secret. Once again, editing this secret will not automatically update the CloudFront function.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  distribution: {
    authentication: {
      username: "username",
      password: new Secret(this, "PasswordSecret", {
        generateSecretString: { excludePunctuation: true },
      }),
    },
  },
});
```

Or, you could provide the password as a plain string, typically read from an environment variable.

> [!WARNING]
>
> This method does NOT meet production security standards, even if the password is not hardcoded into the codebase, because it will result in the password string being readable in the CloudFormation template, which is uploaded to AWS. Use this approach with caution and only in cases where a leak is not considered problematic.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  distribution: {
    authentication: {
      username: "username",
      password: process.env.PASSWORD,
    },
  },
});
```

## With Explicit Cache Invalidation

Cache invalidation is controlled through the `distribution` prop, which is forwarded to the underlying `SiteDistribution` construct. By default, all routes will be flushed from the cache upon deployment. This is performed asynchronously using a step function, so that the deployment procedure does not hold until the invalidation is completed.

You can disable this behavior if you prefer an alternative means of invalidating the cache.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  distribution: {
    invalidateCache: false,
  },
});
```

Or, you can provide the specific routes that you want to flush.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  distribution: {
    invalidateCache: ["/foo/*", "/bar/baz"],
  },
});
```

For the full set of distribution options, see the [`@codedazur/cdk-site-distribution`](../cdk-site-distribution/README.md) package.

## With CORS

If your site needs to handle cross-origin requests, you can configure CORS rules on the bucket.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  bucket: {
    cors: [
      {
        allowedMethods: [HttpMethods.GET, HttpMethods.HEAD],
        allowedOrigins: ["https://example.com"],
        allowedHeaders: ["*"],
      },
    ],
  },
});
```

## With Custom Deployment Settings

You can configure the memory limit and ephemeral storage size for the Lambda function that deploys content to the bucket. This can be useful for large deployments that exceed the defaults.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  deployment: {
    memoryLimit: 1024,
    ephemeralStorageSize: Size.mebibytes(1024),
  },
});
```

You can also deploy the content to a subdirectory of the bucket using the `prefix` option.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  deployment: {
    prefix: "v2",
  },
});
```

## With Custom Error Document

By default, the `StaticSite` will load an `error.html` document when the requested path does not exist. If your application uses a different document, you can override it.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  errorDocument: "404.html",
});
```
