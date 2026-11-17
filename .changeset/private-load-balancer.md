---
"@codedazur/cdk-docker-cluster": minor
"@codedazur/cdk-next-app": minor
---

The load balancer is now internal and connected to the CloudFront distribution as a VPC origin, so it can only be reached through the distribution. Upgrading an existing deployment replaces the load balancer, its listener and its target group.
