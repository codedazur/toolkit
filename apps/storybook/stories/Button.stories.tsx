import { Button, ButtonProps } from "@codedazur/react-components";
import React from "react";
import { story } from "../utilities/story";

export default {
  title: "Components/Button",
  component: Button,
};

const Template = story<ButtonProps>((args) => <Button {...args} />);

export const Default = story(Template, {
  args: {
    children: "Boop",
  },
});
