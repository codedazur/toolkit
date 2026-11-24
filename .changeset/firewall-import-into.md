---
"@codedazur/cdk-firewall": minor
---

Add `importInto(scope)` to `IFirewall`, which returns the firewall for use in another region without `crossRegionReferences`. The firewall stores its ARN in an SSM parameter, and a custom resource in the importing stack reads it on every deploy, so no Lambda functions are deployed in `us-east-1`. In the same region, it returns the firewall itself.
