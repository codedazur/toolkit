# ESLint Config

## Root

In the root of your monorepo, you can use the `base` config:

```ts
import { base } from "@codedazur/eslint-config"
import { defineConfig } from "eslint/config"

export default defineConfig(base)
```

The `base` config includes recommended configs from `eslint`, `ts-eslint`, `prettier` and `turbo`.

## Apps and Packages

For apps and packages in your monorepo, you can extend your monorepo's root config and include more specifics.

```ts
import { next } from "@codedazur/eslint-config"
import { defineConfig } from "eslint/config"
import root from "../../eslint-config"

export default defineConfig(root, next)
```

This config now includes everything from your root config, plus `next`-specific configs (which includes `react` and `react-hooks`).

Besides `base` and `next`, the package includes configs for `cdk`, `react`, `sanity` and `storybook` apps, as well as a `distribution` config for NPM packages.

## Cusomizations

You can easily customize rules and such if needed.

```ts
export default defineConfig(base, {
  rules: {
    "some-rule": "warn"
  }
})
```

You can specify these for your entire monorepo by placing them in the root config, or for a specific app or package by placing them in that specific config.
