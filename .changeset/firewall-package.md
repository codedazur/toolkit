---
"@codedazur/cdk-firewall": minor
---

Add the `Firewall` construct: an AWS WAF web ACL for CloudFront distributions with a per-IP rate limit, the AWS IP reputation, common and known-bad-inputs managed rule groups, and logging of blocked and counted requests. The mode (`block` or `count`), rate limit, managed rule groups, custom rules and logging are configurable.
