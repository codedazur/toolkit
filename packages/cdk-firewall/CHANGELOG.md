# @codedazur/cdk-firewall

## 1.0.0

### Major Changes

- [#327](https://github.com/codedazur/toolkit/pull/327) [`fa5ce16`](https://github.com/codedazur/toolkit/commit/fa5ce16143f89b49cf7df53b9894212ccbb72c12) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Add the `Firewall` construct: an AWS WAF web ACL for CloudFront distributions with a per-IP rate limit and the AWS IP reputation, common and known-bad-inputs managed rule groups. The `authorization` and `cookie` headers are masked in the request data that WAF stores by default. The mode (block or count), rate limit, managed rule groups, custom rules and masking are configurable, and logging to CloudWatch Logs can be enabled with an explicit retention. Existing web ACLs can be imported with `Firewall.fromWebAclArn`.
