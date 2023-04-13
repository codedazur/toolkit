import { useDatePicker } from "@codedazur/react-date-picker";
import { Meta } from "@storybook/react";
import docs from "./useDatePicker.docs.mdx";

const meta: Meta = {
  title: "React Date Picker/useDatePicker",
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;

export const Default = () => {
  const datePicker = useDatePicker();

  return <></>;
};
