const withTM = require("next-transpile-modules")([
  "@codedazur/audio",
  "@codedazur/components",
  "@codedazur/hooks",
  "@codedazur/utilities",
]);

module.exports = withTM({
  reactStrictMode: true,
});
