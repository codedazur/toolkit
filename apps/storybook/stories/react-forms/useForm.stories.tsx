import {
  Button,
  Column,
  FormField,
  Input,
  Select,
} from "@codedazur/react-components";
import {
  FieldProps,
  isEmail,
  isNotEmpty,
  useForm,
} from "@codedazur/react-forms";
import { action } from "@storybook/addon-actions";
import { Meta, StoryObj } from "@storybook/react";
import { DebugOverlay } from "../../components/DebugOverlay";
import docs from "./useForm.docs.mdx";

const meta: Meta = {
  title: "react-forms/useForm",
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;

export const LoginForm: StoryObj = {
  render: function Default() {
    const form = useForm({
      fields: {
        email: { validation: [isNotEmpty, isEmail] },
        password: { validation: [isNotEmpty] },
      },
      onSubmit: action("onSubmit"),
    });

    return (
      <>
        <form onSubmit={form.onSubmit}>
          <Column gap="1rem" width="20rem">
            <InputFormField {...form.fields.email} title="Email" type="email" />
            <InputFormField
              {...form.fields.password}
              title="Password"
              type="password"
            />
            <Button type="submit" disabled={!form.isValid}>
              Submit
            </Button>
          </Column>
        </form>
        <DebugOverlay value={{ form }} />
      </>
    );
  },
};

type TicketsFormFields = {
  date: string;
  type: TicketType;
  tickets: number;
};

enum TicketType {
  OneWay = "OneWay",
  RoundTrip = "RoundTrip",
}

export const TicketsForm: StoryObj = {
  render: function Default() {
    const form = useForm<TicketsFormFields>({
      fields: {
        date: { validation: [isNotEmpty] },
        type: { initialValue: TicketType.OneWay },
        tickets: { validation: [isNotEmpty] },
      },
      onSubmit: action("onSubmit"),
    });

    return (
      <>
        <form onSubmit={form.onSubmit}>
          <Column gap="1rem" width="20rem">
            <InputFormField {...form.fields.date} title="Date" type="date" />
            <SelectFormField
              {...form.fields.type}
              title="Type"
              options={Object.values(TicketType)}
            />
            <InputFormField
              {...form.fields.tickets}
              title="Tickets"
              type="number"
            />
            <Button type="submit" disabled={!form.isValid}>
              Submit
            </Button>
          </Column>
        </form>
        <DebugOverlay value={{ form }} />
      </>
    );
  },
};

const InputFormField = ({
  title,
  type = "text",
  isTouched,
  error,
  ...props
}: { title?: string; type?: string } & FieldProps<
  string | number,
  HTMLInputElement
>) => (
  <FormField title={title} error={isTouched && error}>
    <Input {...props} type={type} error={isTouched && !!error} />
  </FormField>
);

const SelectFormField = ({
  title,
  isTouched,
  error,
  ...props
}: { title?: string; options: string[] } & FieldProps<
  string | number,
  HTMLSelectElement
>) => (
  <FormField title={title} error={isTouched && error}>
    <Select
      {...props}
      options={props.options.map((value) => ({ value, label: value }))}
      error={isTouched && !!error}
    />
  </FormField>
);
