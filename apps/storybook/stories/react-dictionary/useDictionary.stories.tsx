import { Button, Row } from "@codedazur/react-components";
import { DictionaryProvider, useDictionary } from "@codedazur/react-dictionary";
import { Meta, StoryObj } from "@storybook/react";
import docs from "./useDictionary.docs.mdx";

const meta: Meta = {
  title: "React/Dictionary/useDictionary",
  parameters: {
    docs: {
      page: docs,
    },
  },
  args: {
    locale: "de",
  },
  argTypes: {
    locale: {
      control: "select",
      options: ["nl", "de", "en"],
    },
  },
};
export default meta;

const DictionaryConsumer = () => {
  const dictionary = useDictionary();
  const register = dictionary.get("register");

  return (
    <Row>
      <Button>{register}</Button>
    </Row>
  );
};

export const Default: StoryObj<{ locale: string }> = {
  render: function Default({ locale, ...rest }) {
    return (
      <>
        <DictionaryProvider
          {...rest}
          locale={locale}
          dictionaries={{
            en: {
              register: "Register",
            },
            nl: {
              register: "Registreren",
            },
            de: {
              register: "Registrieren",
            },
          }}
        >
          <DictionaryConsumer />
        </DictionaryProvider>
      </>
    );
  },
};
