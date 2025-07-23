import { Preview } from "@storybook/react-vite";
import { WithApp } from "./decorators/WithApp";

const preview: Preview = {
  parameters: {
    layout: "centered",
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [WithApp],
};

export default preview;
