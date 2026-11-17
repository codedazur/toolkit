# @codedazur/cdk-site-distribution

## Firewall

The distribution can be protected by an AWS WAF web ACL, using the [Firewall](https://github.com/codedazur/toolkit/tree/main/packages/cdk-firewall) construct. This is opt-in.

```ts
new SiteDistribution(this, "SiteDistribution", {
  // ...
  firewall: true,
});
```

Provide `FirewallProps` instead of `true` to configure the firewall. See the [Firewall](https://github.com/codedazur/toolkit/tree/main/packages/cdk-firewall) documentation for its defaults and options.

A firewall for CloudFront must be created in `us-east-1`. If your stack is in another region, create the firewall in a separate `us-east-1` stack and attach it by its ARN. This is also useful to share a single web ACL between multiple distributions.

```ts
new SiteDistribution(this, "SiteDistribution", {
  // ...
  firewall: { webAclArn: "arn:aws:wafv2:us-east-1:..." },
});
```

## Migration Guide

### Migrating from `v0` to `v1`

Version `1.0.0` introduces a breaking change to how DNS records are managed. To prevent conflicts with existing records, the `ARecord` resources now automatically delete records with the same name before creating new ones.

To migrate, you must manually delete any existing `ARecord`s that were created by a `v0` version of this construct. After removing the records, you can safely deploy the `v1` version.

Failure to remove the old records will result in a deployment failure.
