import { Button, Column, FormField } from "@codedazur/fusion-ui";
import {
  FieldProps,
  isEmail,
  isNotEmpty,
  useForm,
} from "@codedazur/react-forms";
import { Meta, StoryObj } from "@storybook/react-vite";
import { action } from "storybook/actions";
import { DebugOverlay } from "../../components/DebugOverlay";

const meta: Meta = {
  title: "React/Forms/useForm",
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
          <Column gap={400} size={{ width: 800 }}>
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
          <Column gap={400} size={{ width: 800 }}>
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
  <FormField label={title} error={isTouched && error}>
    <input {...props} type={type} />
  </FormField>
);

function SelectFormField({
  title,
  isTouched,
  error,
  ...props
}: { title?: string; options: string[] } & FieldProps<
  string | number,
  HTMLSelectElement
>) {
  return (
    <FormField label={title} error={isTouched && error}>
      <select {...props}>
        {props.options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </FormField>
  );
}
