# @codedazur/cdk-firewall

An AWS WAF web ACL for CloudFront distributions, with sensible defaults. AWS CDK only offers the low-level `CfnWebACL` resources for WAF, so this construct takes care of rule priorities, metrics, count mode, rate limit exclusions and logging.

It is used by the [SiteDistribution](https://github.com/codedazur/toolkit/tree/main/packages/cdk-site-distribution) construct, but can also be used on its own, for example to create a single web ACL in a `us-east-1` stack and share it between distributions in other regions.

```ts
const firewall = new Firewall(this, "Firewall");

new Distribution(this, "Distribution", {
  // ...
  webAclId: firewall.webAclArn,
});
```

## Defaults

The default firewall contains:

- A rate limit of 3000 requests per IP address per 5 minutes. CloudFront applies the firewall before its cache, so cached responses count towards this limit too.
- The AWS managed `AmazonIpReputationList`, `CommonRuleSet` and `KnownBadInputsRuleSet` rule groups. The `SizeRestrictions_BODY` rule of the common rule set, which blocks request bodies over 8 KB, is set to count, because it breaks most uploads.
- Logging of blocked and counted requests to a CloudWatch log group, retained for one month. Allowed requests are not logged.

A web ACL for CloudFront must be created in `us-east-1`, so the stack that contains the firewall must be deployed to that region. Synthesis fails if the stack has an explicit region other than `us-east-1`.

## Configuration

Start in `count` mode to see which requests would be blocked, by looking at the logs and the metrics in the WAF console, before you switch to `block`.

```ts
new Firewall(this, "Firewall", {
  mode: "count",
  rateLimit: {
    limit: 1000,
    window: Duration.minutes(5),
    excludePaths: ["/assets/"],
  },
  managedRuleGroups: [
    ...Firewall.defaultManagedRuleGroups,
    { name: "AWSManagedRulesAnonymousIpList" },
  ],
  rules: [
    {
      name: "BlockCountries",
      action: { block: {} },
      statement: { geoMatchStatement: { countryCodes: ["XX"] } },
    },
  ],
  logging: { retention: RetentionDays.THREE_MONTHS },
});
```

Custom rules are evaluated first, then the rate limit, then the managed rule groups. Priorities and visibility configuration are assigned automatically.

A firewall costs roughly $5 per month for the web ACL, $1 per month per rule or managed rule group, and $0.60 per million requests, plus the cost of the logs.
