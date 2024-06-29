# StaticSite

## Examples

The minimum needed to get a `StaticSite` up and running is to provide the path to the directory that you want to deploy as your website.

```ts
new StaticSite({
  source: "./path/to/build/output",
});
```

### With Excludes

If your output directory contains files you don't want to include in the deployment, you can exclude those with glob patterns.

```ts
new StaticSite({
  source: {
    directory: "./path/to/build/output",
    excludes: ["foo/*"],
  },
});
```

### With Custom Domain Name

If you provide a domain name and an optional subdomain, Route53 and Certificate Manager will be used to create the necessary resources.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  distribution: {
    domain: {
      name: "example.com",
      subdomain: "foo",
    },
  },
});
```

In the example above, a hosted zone will _NOT_ be created automatically, but will instead be looked up in the AWS account using the domain name. In other words, given the example above, a hosted zone for the domain "example.com" is expected to be present in the account.

Alternatively, you can explicitly provide a reference to the hosted zone.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  distribution: {
    domain: {
      // ...
      zone: new HostedZone(/* ... */),
      // zone: HostedZone.fromLookup(/* ... */),
      // zone: HostedZone.fromHostedZoneId(/* ... */),
    },
  },
});
```

### With Basic Authentication

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

> WARNING: This method does NOT meet production security standards, even if the password is not hardcoded into the codebase, because it will result in the password string being readable in the CloudFormation template, which is uploaded to AWS. Use this approach with caution and only in cases where a leak is not considered problematic.

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

### With Explicit Cache Invalidation

By default, all routes will be flushed from the cache upon deployment. This is performed asynchronously using a step function, so that the deployment procedure does not hold until the invalidation is completed.

You can disable this behavior if you prefer an alternative means of invalidating the cache.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  invalidateCache: false,
});
```

Or, you can provide the specific routes that you want to flush.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  invalidateCache: ["/foo/*", "/bar/baz"],
});
```

### With Custom Error Document

By default, the `StaticSite` will load a `404.html` document when the requested path does not exist. If your application uses a different document, you can override it.

```ts
new StaticSite(this, "StaticSite", {
  // ...
  errorDocument: "error.html",
});
```
