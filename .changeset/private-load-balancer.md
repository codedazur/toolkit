---
"@codedazur/cdk-docker-cluster": major
"@codedazur/cdk-next-app": major
---

The load balancer is now internal by default and connected to the CloudFront distribution as a VPC origin. Its security group only accepts HTTP traffic from the CloudFront origin-facing managed prefix list, so the service can no longer be reached directly via the load balancer's DNS name, bypassing the distribution's authentication, security headers, caching and firewall.

Upgrading an existing deployment replaces the load balancer, its listener and its target group. The ECS service is moved over to the new target group with a rolling deployment and the distribution's origin is switched to the new load balancer, after which the old load balancer is removed. Anything that refers to the old load balancer's DNS name (including the `LoadBalancerDNS` and `ServiceURL` stack outputs) will stop working. Creating the VPC origin can add up to 15 minutes to the deployment.

To keep the previous behavior, set `service.publicLoadBalancer` to `true`.
