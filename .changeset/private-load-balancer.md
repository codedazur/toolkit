---
"@codedazur/cdk-docker-cluster": major
"@codedazur/cdk-next-app": major
---

The load balancer is now internal and connected to the CloudFront distribution as a VPC origin, so it can only be reached through the distribution.

Upgrading an existing deployment replaces the load balancer. Make sure the `@aws-cdk/aws-ecs-patterns:uniqueTargetGroupId` feature flag is enabled in your `cdk.json`, otherwise the deployment fails because the target group cannot be attached to both the old and the new load balancer.
