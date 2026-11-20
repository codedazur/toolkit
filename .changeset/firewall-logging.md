---
"@codedazur/cdk-firewall": major
---

- **Breaking:** rate limiting is now opt-in, because offices and campuses that share an IP address cause false positives. Pass `rateLimit: { limit: 3000 }` to keep the previous behavior. `rateLimit: false` is no longer needed and no longer accepted.
- **Breaking:** the AWS `AWSManagedRulesLinuxRuleSet` and `AWSManagedRulesUnixRuleSet` managed rule groups are added to the defaults.
- Add `FirewallLogBucket`, an S3 bucket for firewall logs with an explicit expiration, which can be in any region, for example to keep logs in the EU. Pass it with `logging: { bucket }`. Logging to CloudWatch Logs in `us-east-1` with `logging: { retention }` is still supported.
