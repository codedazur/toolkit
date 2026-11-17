---
"@codedazur/cdk-site-distribution": minor
---

Add a `firewall` prop that accepts a `Firewall` from `@codedazur/cdk-firewall`. The firewall can be created in a separate `us-east-1` stack when the distribution is in another region. This prop is also available on the `distribution` of a `StaticSite`, `DockerCluster` and `NextApp`.
