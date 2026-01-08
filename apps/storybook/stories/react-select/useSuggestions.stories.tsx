import {
  Box,
  Column,
  FormField,
  Input,
  PopoverMenu,
  Row,
  Text,
} from "@codedazur/fusion-ui";
import { useSuggestions, UseSuggestionsProps } from "@codedazur/react-select";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/nextjs";
import { useCallback, useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";

const defaultOptions = Array.from(
  new Set(Array.from({ length: 10 }).map(() => faker.commerce.product())),
);

export default {
  title: "React/Select/useSuggestions",
  args: {
    options: defaultOptions,
  },
} as Meta<StoryArguments>;

type StoryArguments = UseSuggestionsProps<string>;

type Story = StoryObj<StoryArguments>;

export const Default: Story = {
  render: function Default(args) {
    const { query, setQuery, suggestions } = useSuggestions(args);

    return (
      <>
        <Column gap={400} align="center">
          <Row gap={400}>
            {suggestions.map((suggestion) => (
              <Text key={suggestion} variant="label">
                {suggestion}
              </Text>
            ))}
          </Row>
          <Input
            size={{ width: 800 }}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Column>
        <DebugOverlay value={{ query, suggestions }} />
      </>
    );
  },
};

export const WithCustomFiltering: Story = {
  ...Default,
  args: {
    filter: (query, options) =>
      options.filter((option) => option.match(new RegExp(query, "i"))),
  },
};

export const WithPopover: Story = {
  render: function WithPopover(args) {
    const [open, setOpen] = useState(false);

    const { suggestions, query, setQuery } = useSuggestions(args);

    return (
      <>
        <Box position="relative">
          <Input
            size={{ width: 800 }}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(event) => setQuery(event.target.value)}
          />
          <PopoverMenu
            fit="parent"
            open={open}
            onClose={() => setOpen(false)}
            menu={{
              items: suggestions.map((suggestion) => ({
                label: suggestion,
                onClick: () => {
                  setQuery(suggestion);
                  setOpen(false);
                },
              })),
            }}
          />
        </Box>
        <DebugOverlay value={{ query, suggestions }} />
      </>
    );
  },
};

interface GeocodingResult {
  display_name: string;
}

export const WithAsyncFilter: Story = {
  render: function WithAsyncFilter() {
    const [open, setOpen] = useState(false);

    const filter = useCallback(async (query: string) => {
      const uri = `https://nominatim.openstreetmap.org/search?countrycodes=nl&format=json&q=${encodeURI(
        query,
      )}`;

      const results = (await fetch(uri).then((response) =>
        response.json(),
      )) as GeocodingResult[];

      return results.slice(0, 5).map((result) => result.display_name);
    }, []);

    const { suggestions, query, setQuery } = useSuggestions({
      options: [],
      filter,
      debounce: 300,
    });

    return (
      <>
        <Box position="relative">
          <FormField label="Address">
            <Input
              size={{ width: 800 }}
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(event) => setQuery(event.target.value)}
            />
          </FormField>
          <PopoverMenu
            fit="parent"
            open={open}
            onClose={() => setOpen(false)}
            menu={{
              items: suggestions.map((suggestion) => ({
                label: suggestion,
                onClick: () => {
                  setQuery(suggestion);
                  setOpen(false);
                },
              })),
            }}
          />
        </Box>
        <DebugOverlay value={{ query, suggestions }} />
      </>
    );
  },
};
