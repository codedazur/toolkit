---
"@codedazur/cdk-firewall": major
---

Configure logging with `FirewallLogging`. Replace `logging: { retention }` with `logging: FirewallLogging.toLogGroup({ retention })`. The `logGroup` property of `Firewall` is replaced by `loggingConfiguration`.
