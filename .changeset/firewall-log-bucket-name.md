---
"@codedazur/cdk-firewall": minor
---

Add a `bucketName` prop to `FirewallLogBucket`, so a stack in another region can import the bucket by its name without `crossRegionReferences`. The name must start with `aws-waf-logs-`.
