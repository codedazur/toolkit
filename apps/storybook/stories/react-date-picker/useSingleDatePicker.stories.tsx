import { useSingleDatePicker } from "@codedazur/react-date-picker";
import { Meta } from "@storybook/react";
import docs from "./useSingleDatePicker.docs.mdx";

const meta: Meta = {
  title: "React Date Picker/useSingleDatePicker",
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;

export const Default = () => {
  const datePicker = useSingleDatePicker();

  return <></>;
};
