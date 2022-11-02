const withTM = require("next-transpile-modules")([
  "@codedazur/essentials",
  "@codedazur/react-audio",
  "@codedazur/react-date-picker",
  "@codedazur/react-essentials",
  "@codedazur/react-notifications",
  "@codedazur/react-pagination",
  "@codedazur/react-parallax",
  "@codedazur/react-preferences",
]);

module.exports = withTM({
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
});
