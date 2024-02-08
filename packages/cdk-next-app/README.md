# NextApp

The NextApp CDK construct deploys a standalone Next.js build to AWS Amplify.

## Next.js Configuration

### Standalone Build

Your `next.config.js` needs to set the build output to `standalone` so that it includes the web server and other required components.

```js
module.exports = {
  // ...
  output: "standalone",
  // ...
}
```

### Tracing Root

If your Next.js application is not located in the root of your project, for example because you are using a monorepo, you need to configure the outputfile tracing root to the root of your repository, so that the build includes all of the necessary dependencies.

```js
module.exports = {
  // ...
  experimental: {
    /**
     * This includes files from the monorepo base two directories up.
     * @see https://nextjs.org/docs/pages/api-reference/next-config-js/output#caveats
     */
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
  // ...
};
