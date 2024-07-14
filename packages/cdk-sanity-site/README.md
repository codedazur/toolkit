# SanitySite

This construct is simply a [StaticSite](https://github.com/codedazur/toolkit/tree/main/packages/cdk-static-site#readme) with the addition of a CloudFront ViewerRequest Function to rewrite requests to the `index.html` file, since Sanity is compiled to a single route.

```ts
new SanitySite(this, "Sanity", {
  src: "../sanity/dist",
});
```

For more information on usage and configuration, please refer to the `StaticSite` readme.
