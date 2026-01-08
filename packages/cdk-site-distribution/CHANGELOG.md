# @codedazur/cdk-site-distribution

## 1.0.2

### Patch Changes

- [`2734c9d`](https://github.com/codedazur/toolkit/commit/2734c9d2f1a6fbdbae8e7d676b1e06437200df23) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Props are now marked as readonly.

- Updated dependencies [[`2734c9d`](https://github.com/codedazur/toolkit/commit/2734c9d2f1a6fbdbae8e7d676b1e06437200df23), [`7f3aef0`](https://github.com/codedazur/toolkit/commit/7f3aef08cfc630938d5d47ad8cc6d6fa705c3027), [`7f3aef0`](https://github.com/codedazur/toolkit/commit/7f3aef08cfc630938d5d47ad8cc6d6fa705c3027)]:
  - @codedazur/cdk-cache-invalidator@1.2.3
  - @codedazur/essentials@1.13.0

## 1.0.1

### Patch Changes

- [`b24894a`](https://github.com/codedazur/toolkit/commit/b24894a2de01e596669c2b5aca51bc0b28533106) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Mark the package as side-effect-free for tree shaking.

- Updated dependencies [[`b24894a`](https://github.com/codedazur/toolkit/commit/b24894a2de01e596669c2b5aca51bc0b28533106)]:
  - @codedazur/cdk-cache-invalidator@1.2.2
  - @codedazur/essentials@1.12.1

## 1.0.0

### Major Changes

- [`fa32d93`](https://github.com/codedazur/toolkit/commit/fa32d934b57d6d3aab563881bfaf25b701d35437) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The `ARecord` resources now automatically delete existing records with the same name to prevent clashes with the least amount of downtime and manual work. Any existing domains will need to be removed and re-deployed once to make this work.

## 0.6.1

### Patch Changes

- [`d9802e4`](https://github.com/codedazur/toolkit/commit/d9802e4a5e31e09a1ea99dcd89e5512bc9db4fe4) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Alias records now have unique resource IDs.

## 0.6.0

### Minor Changes

- [`a1e21fa`](https://github.com/codedazur/toolkit/commit/a1e21faf3bb700e9ba6b92cbac345f696e19dd03) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Multiple domains are now supported, as well as providing your own hosted zone certificate and customizing the error responses.

## 0.5.3

### Patch Changes

- [`315085a`](https://github.com/codedazur/toolkit/commit/315085a029c6f0f2f71b1a48ea223b0b78d316aa) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The SiteDistribution's functions attribute was made public.

## 0.5.2

### Patch Changes

- [`951ff0b`](https://github.com/codedazur/toolkit/commit/951ff0b7d2d6add7796989801052717b7f486ff8) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The CloudFront functions are now created in sequence in order to stay under the rate limit.

## 0.5.1

### Patch Changes

- [`fd47292`](https://github.com/codedazur/toolkit/commit/fd4729230f53aefd5ff29617b99420f9a1df2398) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The functions' behavior suffix is now configured correctly.

## 0.5.0

### Minor Changes

- [`ddef1e0`](https://github.com/codedazur/toolkit/commit/ddef1e023538d35ecf637a30e654f10ebb06d8d2) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Additional behaviors are now supported.

## 0.4.0

### Minor Changes

- [`7d709c8`](https://github.com/codedazur/toolkit/commit/7d709c8be6ea8b0573443e9cc138d7b909412a30) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - You can now choose which HTTP methods to allow.

## 0.3.0

### Minor Changes

- [`d557d82`](https://github.com/codedazur/toolkit/commit/d557d822ffe8e42b0907f1d4e1a2b243f3430674) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - It is now supported to provide a custom origin request policy.

## 0.2.0

### Minor Changes

- [`4f8716c`](https://github.com/codedazur/toolkit/commit/4f8716c534265493e708ede8239bd47d38ff83a4) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Custom cache policies are now supported.

### Patch Changes

- [`4f8716c`](https://github.com/codedazur/toolkit/commit/4f8716c534265493e708ede8239bd47d38ff83a4) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Cross origin embedding is now allwed by default.

## 0.1.6

### Patch Changes

- [`fdbd655`](https://github.com/codedazur/toolkit/commit/fdbd65536edc88074817e9256f99f30a5e1c3680) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The appendSlash function was moved from the SiteDistribution to the StaticSite construct.

## 0.1.5

### Patch Changes

- [`1c02632`](https://github.com/codedazur/toolkit/commit/1c026324d77c3ebeb81f9722a41a88cf8947d2c0) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The CloudFront functions are created in series to reduce the chances of hitting the service rate limit.

## 0.1.4

### Patch Changes

- [`58b894d`](https://github.com/codedazur/toolkit/commit/58b894d62bfd01f852233a95b75ffa538a5bc7f1) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Cache invalidation is now triggered correctly.

## 0.1.3

### Patch Changes

- [`0034613`](https://github.com/codedazur/toolkit/commit/0034613fbf086d5e634a9a09d4273025b9a647aa) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The CloudFront function runtime was downgraded to avoid rate limiting during deployment.

## 0.1.2

### Patch Changes

- [`d9e51b0`](https://github.com/codedazur/toolkit/commit/d9e51b0e2fb36d64c641ae341124b0fb2bd298df) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The Certificate construct is now used instead of the deprecated DnsValidatedCertificate.

## 0.1.1

### Patch Changes

- [`640554d`](https://github.com/codedazur/toolkit/commit/640554d76addc0da87c05d416d6e2af7448d816b) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The password secret is only referenced when authentication is enabled.

## 0.1.0

### Minor Changes

- [`d1f3d51`](https://github.com/codedazur/toolkit/commit/d1f3d512d31d659ffdc115147d9631057fe8d073) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Experimental release.

### Patch Changes

- [`17034ee`](https://github.com/codedazur/toolkit/commit/17034ee5fcbc026fc779a12130572d515d2b8298) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Dependency versions were made explicit.

- Updated dependencies [[`17034ee`](https://github.com/codedazur/toolkit/commit/17034ee5fcbc026fc779a12130572d515d2b8298)]:
  - @codedazur/cdk-cache-invalidator@1.2.1
