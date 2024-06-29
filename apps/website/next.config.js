/* eslint-disable @typescript-eslint/no-var-requires */
const withTM = require("next-transpile-modules")([
  "@codedazur/essentials",
  "@codedazur/react-date-picker",
  "@codedazur/react-dictionary",
  "@codedazur/react-essentials",
  "@codedazur/react-forms",
  "@codedazur/react-media",
  "@codedazur/react-notifications",
  "@codedazur/react-pagination",
  "@codedazur/react-parallax",
  "@codedazur/react-preferences",
  "@codedazur/react-select",
  "@codedazur/react-tracking",
]);

module.exports = withTM({
  reactStrictMode: true,
  output: "export",
  compiler: {
    styledComponents: true,
  },
});
