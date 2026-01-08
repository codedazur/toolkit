import { Preview } from "@storybook/nextjs";
import { INITIAL_VIEWPORTS } from "storybook/viewport";
import { WithApp } from "./decorators/WithApp";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      grid: {
        cellSize: 16,
        opacity: 0.1,
      },
      disabled: true,
    },
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  decorators: [WithApp],
};

export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Change the theme of the app.",
    defaultValue: "Dark",
    toolbar: {
      icon: "paintbrush",
      items: ["Light", "Dark"],
    },
  },
};

export default preview;
