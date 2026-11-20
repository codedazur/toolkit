---
"@codedazur/cdk-firewall": minor
---

Add `FirewallLogBucket`, an S3 bucket for firewall logs with an explicit expiration, which can be in any region, for example to keep logs in the EU. Pass it to a firewall with `logging: FirewallLogging.toBucket(bucket)`.
