---
"@codedazur/cdk-docker-cluster": minor
---

Enable the WAF firewall on the distribution by default when the stack is deployed to `us-east-1`. In other regions, or when the stack has no explicit region, no firewall is created and a synth warning explains how to enable it. Set `distribution.firewall` to `false` to opt out, or to `{ mode: "count" }` to evaluate the rules before enforcing them.

Note that this adds WAF costs (roughly $10 per month plus $0.60 per million requests) to existing deployments in `us-east-1`.
