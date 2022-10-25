import { Button, ButtonProps } from "@codedazur/react-components";
import { story } from "../utilities/story";

export default {
  title: "Components/Button",
  component: Button,
};

export const Default = story<ButtonProps>((args) => <Button {...args} />, {
  args: {
    children: "Boop",
  },
});
