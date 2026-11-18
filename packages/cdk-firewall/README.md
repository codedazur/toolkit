# @codedazur/cdk-firewall

An AWS WAF web ACL for CloudFront distributions, with sensible defaults. AWS CDK only offers the low-level `CfnWebACL` resources for WAF, so this construct takes care of rule priorities, metrics, count mode, rate limit exclusions and logging.

Pass it to a [SiteDistribution](https://github.com/codedazur/toolkit/tree/main/packages/cdk-site-distribution), or to any construct that is based on it, such as a [StaticSite](https://github.com/codedazur/toolkit/tree/main/packages/cdk-static-site), [DockerCluster](https://github.com/codedazur/toolkit/tree/main/packages/cdk-docker-cluster) or [NextApp](https://github.com/codedazur/toolkit/tree/main/packages/cdk-next-app).

## Regions

A firewall for CloudFront must be created in `us-east-1`. Synthesis fails if the stack that contains the firewall has another region.

If your application is deployed to `us-east-1`, create the firewall in the same stack.

```ts
new DockerCluster(this, "DockerCluster", {
  // ...
  distribution: {
    firewall: new Firewall(this, "Firewall"),
  },
});
```

If your application is deployed to another region, create the firewall in a separate `us-east-1` stack and pass it to the stack of your application. Both stacks need `crossRegionReferences` enabled. CloudFront certificates have the same requirement, so this is also a good place to create those.

```ts
const edge = new Stack(app, "Edge", {
  env: { account, region: "us-east-1" },
  crossRegionReferences: true,
});

const firewall = new Firewall(edge, "Firewall");

const certificate = new Certificate(edge, "Certificate", {
  domainName: "example.com",
  validation: CertificateValidation.fromDns(hostedZone),
});

const site = new Stack(app, "Site", {
  env: { account, region: "eu-central-1" },
  crossRegionReferences: true,
});

new DockerCluster(site, "DockerCluster", {
  // ...
  distribution: {
    domain: "example.com",
    hostedZone,
    certificate,
    firewall,
  },
});
```

Deploying the stack of your application deploys the `us-east-1` stack first. The account must be [bootstrapped](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) in `us-east-1` as well.

Cross-region references prevent the `us-east-1` stack from deleting a resource that the other stack still uses. Replacing the firewall or certificate, rather than updating it, therefore takes two deployments. Changes to the rules of a firewall are updates, so they are not affected.

## Existing Web ACLs

If you already have a web ACL, for example one that was created in the AWS console or by another CDK app, import it by its ARN instead of creating a new firewall. Nothing is created, so this works from a stack in any region.

```ts
new DockerCluster(this, "DockerCluster", {
  // ...
  distribution: {
    firewall: Firewall.fromWebAclArn(
      this,
      "Firewall",
      "arn:aws:wafv2:us-east-1:...",
    ),
  },
});
```

## Defaults

The default firewall contains:

- A rate limit of 3000 requests per IP address per 5 minutes. CloudFront applies the firewall before its cache, so cached responses count towards this limit too.
- The AWS managed `AmazonIpReputationList`, `CommonRuleSet` and `KnownBadInputsRuleSet` rule groups. The `SizeRestrictions_BODY` rule of the common rule set, which blocks request bodies over 8 KB, is set to count, because it breaks most uploads.
- Masking of the `authorization` and `cookie` headers in the request data that WAF stores, because they typically contain session tokens.
- No logging. See [Logging and Personal Data](#logging-and-personal-data).

## Configuration

Start in `count` mode to see which requests would be blocked, by looking at the metrics and sampled requests in the WAF console, before you switch to `block`.

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
});
```

Custom rules are evaluated first, then the rate limit, then the managed rule groups. Priorities and visibility configuration are assigned automatically.

A firewall costs roughly $5 per month for the web ACL, $1 per month per rule or managed rule group, and $0.60 per million requests, plus the cost of the logs if logging is enabled.

## Logging and Personal Data

WAF processes the IP address of every visitor to apply the rate limit and IP reputation rules, but by default, the only request data it stores are **sampled requests**: a sample of recent requests per rule, including their IP addresses and headers, which AWS keeps for 3 hours and shows in the WAF console. CloudWatch metrics per rule contain no personal data.

Logging of blocked and counted requests to CloudWatch Logs is opt-in. Logs are useful to analyze attacks or false positives after the fact, but they contain personal data, so you must choose how long they are retained.

```ts
new Firewall(this, "Firewall", {
  logging: { retention: RetentionDays.ONE_WEEK },
});
```

Keep in mind that:

- Logs are stored in `us-east-1`, the region of the firewall.
- Logs contain the IP addresses of visitors, which are personal data. WAF can not mask IP addresses.
- Logs contain all request headers and the full URL, including the query string. Only the `authorization` and `cookie` headers are masked by default.
- When a rule matches part of the request body, such as a form submission, that part is included in the log.

### Masking

Masking applies to both logs and sampled requests. If other headers, cookies, query parameters or the body of your application contain personal data or secrets, mask those as well. Include the defaults to keep masking the `authorization` and `cookie` headers.

```ts
new Firewall(this, "Firewall", {
  dataProtections: [
    ...Firewall.defaultDataProtections,
    {
      field: { fieldType: "SINGLE_QUERY_ARGUMENT", fieldKeys: ["email"] },
      action: "HASH",
    },
  ],
});
```

`SUBSTITUTION` replaces the value with `REDACTED`, while `HASH` replaces it with a hash, so you can still tell whether two requests contain the same value. See [Data protection](https://docs.aws.amazon.com/waf/latest/developerguide/data-protection-masking.html) for all options.
