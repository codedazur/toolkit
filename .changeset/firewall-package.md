---
"@codedazur/cdk-firewall": major
---

Add the `Firewall` construct: an AWS WAF web ACL for CloudFront distributions with a per-IP rate limit and the AWS IP reputation, common and known-bad-inputs managed rule groups. The `authorization` and `cookie` headers are always masked in the request data that WAF stores. The mode (`block` or `count`), rate limit, managed rule groups and custom rules are configurable, and logging to CloudWatch Logs can be enabled with an explicit retention. Existing web ACLs can be imported with `Firewall.fromWebAclArn`.
