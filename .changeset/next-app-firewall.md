---
"@codedazur/cdk-next-app": minor
---

Add the `NextAppFirewall` construct: a `Firewall` with additional rules for Next.js. It blocks the internal `x-middleware-subrequest` header (CVE-2025-29927) and excludes `/_next/static/` and `/_next/image` from the rate limit.
