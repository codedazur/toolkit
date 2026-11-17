---
"@codedazur/cdk-next-app": minor
---

Tailor the default firewall to Next.js. In addition to the DockerCluster defaults, it blocks the internal `x-middleware-subrequest` header (CVE-2025-29927) and excludes `/_next/static/` and `/_next/image` from the rate limit. The defaults are available as `NextApp.firewall` for extension.
