# @codedazur/cdk-site-distribution

## Firewall

The distribution can be protected by an AWS WAF web ACL, created with the [Firewall](https://github.com/codedazur/toolkit/tree/main/packages/cdk-firewall) construct.

```ts
new SiteDistribution(this, "SiteDistribution", {
  // ...
  firewall: new Firewall(this, "Firewall"),
});
```

A firewall for CloudFront must be created in `us-east-1`. If your stack is in another region, see the [Firewall](https://github.com/codedazur/toolkit/tree/main/packages/cdk-firewall#regions) documentation for how to create it in a separate stack.

## Migration Guide

### Migrating from `v0` to `v1`

Version `1.0.0` introduces a breaking change to how DNS records are managed. To prevent conflicts with existing records, the `ARecord` resources now automatically delete records with the same name before creating new ones.

To migrate, you must manually delete any existing `ARecord`s that were created by a `v0` version of this construct. After removing the records, you can safely deploy the `v1` version.

Failure to remove the old records will result in a deployment failure.
