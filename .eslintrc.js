module.exports = {
  root: true,
  extends: ["@codedazur", "plugin:storybook/recommended"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
