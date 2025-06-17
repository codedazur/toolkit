# @codedazur/cdk-static-site

## 3.1.0

### Minor Changes

- [`fc9ea9d`](https://github.com/codedazur/toolkit/commit/fc9ea9d94f25ea967518dc20020ecaaf00dbc4e3) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Three different request rewrite modes are now supported.

## 3.0.0

### Major Changes

- [`fa32d93`](https://github.com/codedazur/toolkit/commit/fa32d934b57d6d3aab563881bfaf25b701d35437) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - If you provide your own distribution domain names, the `ARecord` resources now automatically delete existing records with the same name to prevent clashes with the least amount of downtime and manual work. Any existing domains will need to be removed and re-deployed once to make this work.
- Updated dependencies [[`fa32d93`](https://github.com/codedazur/toolkit/commit/fa32d934b57d6d3aab563881bfaf25b701d35437)]:
  - @codedazur/cdk-site-distribution@1.0.0

## 2.1.7

### Patch Changes

- Updated dependencies [[`0cb5427`](https://github.com/codedazur/toolkit/commit/0cb5427497b00982e084df1a7c8cda29fa6eab33)]:
  - @codedazur/cdk-site-distribution@0.6.1

## 2.1.6

### Patch Changes

- Updated dependencies [[`a1e21fa`](https://github.com/codedazur/toolkit/commit/a1e21faf3bb700e9ba6b92cbac345f696e19dd03)]:
  - @codedazur/cdk-site-distribution@0.6.0

## 2.1.5

### Patch Changes

- Updated dependencies [[`315085a`](https://github.com/codedazur/toolkit/commit/315085a029c6f0f2f71b1a48ea223b0b78d316aa)]:
  - @codedazur/cdk-site-distribution@0.5.3

## 2.1.4

### Patch Changes

- Updated dependencies [[`ddef1e0`](https://github.com/codedazur/toolkit/commit/361f03c2aafe7a2bc04789b433c99ca79350da2a)]:
  - @codedazur/cdk-site-distribution@0.5.2

## 2.1.3

### Patch Changes

- Updated dependencies [[`ddef1e0`](https://github.com/codedazur/toolkit/commit/386a7c9615180fe642ea240ce7a90086d9a4b744)]:
  - @codedazur/cdk-site-distribution@0.5.1

## 2.1.2

### Patch Changes

- Updated dependencies [[`ddef1e0`](https://github.com/codedazur/toolkit/commit/ddef1e023538d35ecf637a30e654f10ebb06d8d2)]:
  - @codedazur/cdk-site-distribution@0.5.0

## 2.1.1

### Patch Changes

- Updated dependencies [[`7d709c8`](https://github.com/codedazur/toolkit/commit/7d709c8be6ea8b0573443e9cc138d7b909412a30)]:
  - @codedazur/cdk-site-distribution@0.4.0

## 2.1.0

### Minor Changes

- [`d557d82`](https://github.com/codedazur/toolkit/commit/d557d822ffe8e42b0907f1d4e1a2b243f3430674) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The S3 origin with CORS origin request policy is now used by default.

### Patch Changes

- Updated dependencies [[`d557d82`](https://github.com/codedazur/toolkit/commit/d557d822ffe8e42b0907f1d4e1a2b243f3430674)]:
  - @codedazur/cdk-site-distribution@0.3.0

## 2.0.6

### Patch Changes

- Updated dependencies [[`4f8716c`](https://github.com/codedazur/toolkit/commit/4f8716c534265493e708ede8239bd47d38ff83a4), [`4f8716c`](https://github.com/codedazur/toolkit/commit/4f8716c534265493e708ede8239bd47d38ff83a4)]:
  - @codedazur/cdk-site-distribution@0.2.0

## 2.0.5

### Patch Changes

- [`fdbd655`](https://github.com/codedazur/toolkit/commit/fdbd65536edc88074817e9256f99f30a5e1c3680) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The appendSlash function was moved from the SiteDistribution to the StaticSite construct.

- Updated dependencies [[`fdbd655`](https://github.com/codedazur/toolkit/commit/fdbd65536edc88074817e9256f99f30a5e1c3680)]:
  - @codedazur/cdk-site-distribution@0.1.6

## 2.0.4

### Patch Changes

- Updated dependencies [[`1c02632`](https://github.com/codedazur/toolkit/commit/1c026324d77c3ebeb81f9722a41a88cf8947d2c0)]:
  - @codedazur/cdk-site-distribution@0.1.5

## 2.0.3

### Patch Changes

- Updated dependencies [[`58b894d`](https://github.com/codedazur/toolkit/commit/58b894d62bfd01f852233a95b75ffa538a5bc7f1)]:
  - @codedazur/cdk-site-distribution@0.1.4

## 2.0.2

### Patch Changes

- Updated dependencies [[`1296f15`](https://github.com/codedazur/toolkit/commit/1296f15e14e538c4a64f827435335251c547940e)]:
  - @codedazur/cdk-site-distribution@0.1.3

## 2.0.1

### Patch Changes

- [`49582be`](https://github.com/codedazur/toolkit/commit/49582be94f1f39d57a359fb2ae69c303f0503871) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Updated dependencies.

## 2.0.0

### Major Changes

- [`d1f3d51`](https://github.com/codedazur/toolkit/commit/d1f3d512d31d659ffdc115147d9631057fe8d073) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The props were reorganized into source and distribution.

### Minor Changes

- [`754365d`](https://github.com/codedazur/toolkit/commit/754365d273433d82aa30769c5a5168394a26e53a) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Particular file patterns can now be excluded from deployment.

### Patch Changes

- [`17034ee`](https://github.com/codedazur/toolkit/commit/17034ee5fcbc026fc779a12130572d515d2b8298) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Dependency versions were made explicit.

- Updated dependencies [[`17034ee`](https://github.com/codedazur/toolkit/commit/17034ee5fcbc026fc779a12130572d515d2b8298), [`d1f3d51`](https://github.com/codedazur/toolkit/commit/d1f3d512d31d659ffdc115147d9631057fe8d073)]:
  - @codedazur/cdk-site-distribution@0.1.0

## 1.1.1

### Patch Changes

- [`7789bf2c5dfbda3420d9ce69057e5310b8a32e4b`](https://github.com/codedazur/toolkit/commit/7789bf2c5dfbda3420d9ce69057e5310b8a32e4b) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Cache invalidations are no longer awaited when awaitCacheInvalidations is not set to true.

## 1.1.0

### Minor Changes

- [`dd2a6c9`](https://github.com/codedazur/toolkit/commit/dd2a6c9934b9b0ad2fb63e45e963d94d3ebf6dca) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Transpile TypeScript to CJS and ESM.

### Patch Changes

- Updated dependencies [[`dd2a6c9`](https://github.com/codedazur/toolkit/commit/dd2a6c9934b9b0ad2fb63e45e963d94d3ebf6dca)]:
  - @codedazur/cdk-cache-invalidator@1.1.0

## 1.0.1

### Patch Changes

- [#152](https://github.com/codedazur/toolkit/pull/152) [`042b4eb`](https://github.com/codedazur/toolkit/commit/042b4ebe6246694fc6bcd3fa4aa721330dbacf5a) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - correct default cache invalidation procedure

## 1.0.0

### Major Changes

- [#133](https://github.com/codedazur/toolkit/pull/133) [`678b5f7`](https://github.com/codedazur/toolkit/commit/678b5f7e0358cba7bdc0c0fc6dcb1a12658c1663) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - stable release

### Patch Changes

- Updated dependencies [[`8996031`](https://github.com/codedazur/toolkit/commit/8996031f86872cf66ab42bb0ec1629079e4cb1c2)]:
  - @codedazur/cdk-cache-invalidator@1.0.0

## 0.2.0

### Minor Changes

- [`9df692f`](https://github.com/codedazur/toolkit/commit/9df692fe2851107745c4f7d074dc43a2f56b277a) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Allow framing from the same origin.

## 0.1.0

### Minor Changes

- [`c71b371`](https://github.com/codedazur/toolkit/commit/c71b37113d2a2b377c439ec4eeebc780689a165b) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - support CloudFront price class

- [`c71b371`](https://github.com/codedazur/toolkit/commit/c71b37113d2a2b377c439ec4eeebc780689a165b) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - add security headers

## 0.0.1

### Patch Changes

- 369cc3d: add changesets
