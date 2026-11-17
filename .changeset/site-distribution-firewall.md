---
"@codedazur/cdk-site-distribution": minor
---

Add opt-in WAF firewall support through the `firewall` prop, using the new `@codedazur/cdk-firewall` package. Set it to `true` for the default firewall, provide `FirewallProps` to configure it, or provide `{ webAclArn }` to attach an existing web ACL. A firewall that is created by the construct requires the stack to be deployed to `us-east-1`.
