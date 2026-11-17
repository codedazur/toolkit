---
"@codedazur/cdk-amplify-app": patch
"@codedazur/cdk-bastion-host": patch
"@codedazur/cdk-cache-invalidator": patch
"@codedazur/cdk-docker-cluster": patch
"@codedazur/cdk-firewall": patch
"@codedazur/cdk-mailer": patch
"@codedazur/cdk-next-app": patch
"@codedazur/cdk-rpc-api": patch
"@codedazur/cdk-site-distribution": patch
"@codedazur/cdk-static-site": patch
"@codedazur/eslint-config": patch
"@codedazur/essentials": patch
"@codedazur/react-date-picker": patch
"@codedazur/react-dictionary": patch
"@codedazur/react-essentials": patch
"@codedazur/react-forms": patch
"@codedazur/react-media": patch
"@codedazur/react-notifications": patch
"@codedazur/react-pagination": patch
"@codedazur/react-parallax": patch
"@codedazur/react-preferences": patch
"@codedazur/react-select": patch
"@codedazur/react-tracking": patch
---

Publish only the build output. Packages now declare `"files": ["dist"]` instead of relying on `.npmignore`, so `dist` is always included regardless of the repository's `.gitignore`, and source files, tests, configs and build logs are no longer published.
