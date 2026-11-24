# @codedazur/cdk-firewall

## 2.1.0

### Minor Changes

- [#334](https://github.com/codedazur/toolkit/pull/334) [`67b4d13`](https://github.com/codedazur/toolkit/commit/67b4d138d2c4544634cbc5d28ef27d1cfbd1b445) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Add a `bucketName` prop to `FirewallLogBucket`, so a stack in another region can import the bucket by its name without `crossRegionReferences`. The name must start with `aws-waf-logs-`.

## 2.0.0

### Major Changes

- [#332](https://github.com/codedazur/toolkit/pull/332) [`328ea8d`](https://github.com/codedazur/toolkit/commit/328ea8deef3937080e164132ab215ab035e9b743) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Add the AWS `AWSManagedRulesLinuxRuleSet` and `AWSManagedRulesUnixRuleSet` managed rule groups to the defaults. They block attempts to access Linux system files and command injection.

- [#332](https://github.com/codedazur/toolkit/pull/332) [`a145996`](https://github.com/codedazur/toolkit/commit/a145996e35dd574dd1b5263dc8e476a68d943c37) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Configure logging with `FirewallLogging`. Replace `logging: { retention }` with `logging: FirewallLogging.toLogGroup({ retention })`. The `logGroup` property of `Firewall` is replaced by `loggingConfiguration`.

- [#332](https://github.com/codedazur/toolkit/pull/332) [`328ea8d`](https://github.com/codedazur/toolkit/commit/328ea8deef3937080e164132ab215ab035e9b743) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Rate limiting is now opt-in, because offices and campuses that share an IP address cause false positives. Pass `rateLimit: { limit: 3000 }` to keep the previous behavior. Remove `rateLimit: false`, which is no longer needed and no longer accepted.

### Minor Changes

- [#332](https://github.com/codedazur/toolkit/pull/332) [`328ea8d`](https://github.com/codedazur/toolkit/commit/328ea8deef3937080e164132ab215ab035e9b743) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Add `FirewallLogBucket`, an S3 bucket for firewall logs with an explicit expiration, which can be in any region, for example to keep logs in the EU. Pass it to a firewall with `logging: FirewallLogging.toBucket(bucket)`.

## 1.0.0

### Major Changes

- [#327](https://github.com/codedazur/toolkit/pull/327) [`fa5ce16`](https://github.com/codedazur/toolkit/commit/fa5ce16143f89b49cf7df53b9894212ccbb72c12) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Add the `Firewall` construct: an AWS WAF web ACL for CloudFront distributions with a per-IP rate limit and the AWS IP reputation, common and known-bad-inputs managed rule groups. The `authorization` and `cookie` headers are masked in the request data that WAF stores by default. The mode (block or count), rate limit, managed rule groups, custom rules and masking are configurable, and logging to CloudWatch Logs can be enabled with an explicit retention. Existing web ACLs can be imported with `Firewall.fromWebAclArn`.
