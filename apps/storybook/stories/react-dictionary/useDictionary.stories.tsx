import { Button, Row } from "@codedazur/fusion-ui";
import { DictionaryProvider, useDictionary } from "@codedazur/react-dictionary";
import { Meta, StoryObj } from "@storybook/nextjs";

const meta: Meta = {
  title: "React/Dictionary/useDictionary",
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
