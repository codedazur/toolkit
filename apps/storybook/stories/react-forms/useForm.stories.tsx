import { Button, Column, FormField, Input } from "@codedazur/react-components";
import { isEmail, isNotEmpty, useForm } from "@codedazur/react-forms";
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
            <FormField
              title="Email"
              error={form.fields.email.isTouched && form.fields.email.error}
            >
              <Input
                type="email"
                {...form.fields.email}
                error={form.fields.email.isTouched && !!form.fields.email.error}
              />
            </FormField>
            <FormField
              title="Password"
              error={
                form.fields.password.isTouched && form.fields.password.error
              }
            >
              <Input
                type="password"
                {...form.fields.password}
                error={
                  form.fields.password.isTouched && !!form.fields.password.error
                }
              />
            </FormField>
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
        type: { validation: [isNotEmpty] },
        tickets: { validation: [isNotEmpty] },
      },
      onSubmit: action("onSubmit"),
    });

    return (
      <>
        <form onSubmit={form.onSubmit}>
          <Column gap="1rem" width="20rem">
            <FormField
              title="Date"
              error={form.fields.date.isTouched && form.fields.date.error}
            >
              <Input
                type="date"
                {...form.fields.date}
                error={form.fields.date.isTouched && !!form.fields.date.error}
              />
            </FormField>
            <FormField
              title="Type"
              error={form.fields.type.isTouched && form.fields.type.error}
            >
              <select {...form.fields.type}>
                {Object.values(TicketType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              title="Tickets"
              error={form.fields.tickets.isTouched && form.fields.tickets.error}
            >
              <Input
                type="number"
                {...form.fields.tickets}
                error={
                  form.fields.tickets.isTouched && !!form.fields.tickets.error
                }
              />
            </FormField>
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
