---
"@codedazur/cdk-firewall": major
---

Add the `Firewall` construct: an AWS WAF web ACL for CloudFront distributions with the AWS IP reputation, common, known-bad-inputs, Linux and Unix managed rule groups. The `authorization` and `cookie` headers are masked in the request data that WAF stores by default. The mode (block or count), managed rule groups, custom rules and masking are configurable, and a per-IP rate limit can be enabled. Logging can be enabled to a `FirewallLogBucket`, an S3 bucket with an explicit expiration that can be in any region, or to CloudWatch Logs in `us-east-1` with an explicit retention. Existing web ACLs can be imported with `Firewall.fromWebAclArn`.
