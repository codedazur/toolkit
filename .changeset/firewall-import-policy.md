---
"@codedazur/cdk-firewall": patch
---

Fix the IAM policy of `importInto`, which named an invalid SSM parameter ARN, so reading the parameter from another region was denied.
