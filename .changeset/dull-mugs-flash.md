---
"@codedazur/cdk-site-distribution": major
---

The `ARecord` resources now automatically delete existing records with the same name to prevent clashes with the least amount of downtime and manual work. Any existing domains will need to be removed and re-deployed once to make this work.
