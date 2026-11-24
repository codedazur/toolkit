---
"@codedazur/cdk-firewall": minor
---

Remove the synth-time check that a `Firewall` is in `us-east-1`. A firewall in another region now fails at deploy with AWS's own error.
