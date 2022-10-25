const withTM = require("next-transpile-modules")([
  "@codedazur/essentials",
  "@codedazur/react-audio",
  "@codedazur/react-date-picker",
  "@codedazur/react-essentials",
  "@codedazur/react-notifications",
  "@codedazur/react-pagination",
  "@codedazur/react-parallax",
]);

module.exports = withTM({
  reactStrictMode: true,
});
