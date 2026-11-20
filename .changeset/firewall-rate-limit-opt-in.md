---
"@codedazur/cdk-firewall": major
---

Rate limiting is now opt-in, because offices and campuses that share an IP address cause false positives. Pass `rateLimit: { limit: 3000 }` to keep the previous behavior. Remove `rateLimit: false`, which is no longer needed and no longer accepted.
