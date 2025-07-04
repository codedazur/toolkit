# @codedazur/cdk-sanity-site

## 1.0.2

### Patch Changes

- [`b24894a`](https://github.com/codedazur/toolkit/commit/b24894a2de01e596669c2b5aca51bc0b28533106) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Mark the package as side-effect-free for tree shaking.

- Updated dependencies [[`b24894a`](https://github.com/codedazur/toolkit/commit/b24894a2de01e596669c2b5aca51bc0b28533106)]:
  - @codedazur/cdk-static-site@3.1.1

## 1.0.1

### Patch Changes

- [`51531ab`](https://github.com/codedazur/toolkit/commit/51531abe89589bc2daf07780a138e39eb0476821) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The SanitySite has been marked as deprecated in favor of the StaticSite with the SinglePage rewrite mode.

- Updated dependencies [[`fc9ea9d`](https://github.com/codedazur/toolkit/commit/fc9ea9d94f25ea967518dc20020ecaaf00dbc4e3)]:
  - @codedazur/cdk-static-site@3.1.0

## 1.0.0

### Major Changes

- [`fa32d93`](https://github.com/codedazur/toolkit/commit/fa32d934b57d6d3aab563881bfaf25b701d35437) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - If you provide your own distribution domain names, the `ARecord` resources now automatically delete existing records with the same name to prevent clashes with the least amount of downtime and manual work. Any existing domains will need to be removed and re-deployed once to make this work.
- Updated dependencies [[`fa32d93`](https://github.com/codedazur/toolkit/commit/fa32d934b57d6d3aab563881bfaf25b701d35437)]:
  - @codedazur/cdk-static-site@3.0.0

## 0.1.2

### Patch Changes

- [`581ed2f`](https://github.com/codedazur/toolkit/commit/581ed2fdd4dee53c4c6984ce87b862302366d04f) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - The rewrite function's static pattern has been corrected.

## 0.1.1

### Patch Changes

- [`307d746`](https://github.com/codedazur/toolkit/commit/307d7468f11177b60c02e03d7111c6b08a4a19f3) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Every request that is not to a static file is now rewritten to the index.

- Updated dependencies []:
  - @codedazur/cdk-static-site@2.1.1

## 0.1.0

### Minor Changes

- [`fa1f7e5`](https://github.com/codedazur/toolkit/commit/fa1f7e56250e13a58badd908e7ff46973ac18d16) Thanks [@thijsdaniels](https://github.com/thijsdaniels)! - Experimental release.

### Patch Changes

- Updated dependencies [[`d557d82`](https://github.com/codedazur/toolkit/commit/d557d822ffe8e42b0907f1d4e1a2b243f3430674)]:
  - @codedazur/cdk-static-site@2.1.0
