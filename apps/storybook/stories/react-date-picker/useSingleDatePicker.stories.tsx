import { useSingleDatePicker } from "@codedazur/react-date-picker";
import { Meta, Story } from "@storybook/react";
import docs from "./useSingleDatePicker.docs.mdx";

export default {
  parameters: {
    docs: {
      page: docs,
    },
  },
} as Meta;

export const Default: Story = () => {
  const datePicker = useSingleDatePicker();

  return <></>;
};
