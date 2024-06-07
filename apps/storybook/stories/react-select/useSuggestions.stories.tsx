import {
  Button,
  CheckIcon,
  Column,
  Divider,
  FormField,
  highlight,
  Identifiable,
  Origin,
  Placeholder,
  Popover,
  PopoverProps,
  Row,
  ScrollView,
  Separate,
  SizedBox,
  TextInput,
  useSuggestions,
  UseSuggestionsProps,
} from "@codedazur/react-components";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/react";
import { MutableRefObject, useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { DebugOverlay } from "../../components/DebugOverlay";
import { Monospace } from "../../components/Monospace";

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
        <SizedBox width="20rem">
          <TextInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </SizedBox>
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
    const ref = useRef<HTMLDivElement | null>(null);

    const { suggestions, query, setQuery } = useSuggestions(args);

    return (
      <>
        <SizedBox width="20rem">
          <TextInput
            boxRef={ref}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(event) => setQuery(event.target.value)}
          />
        </SizedBox>
        <Suggestions
          anchor={ref}
          open={open}
          onClose={() => setOpen(false)}
          suggestions={suggestions}
          onSelect={(value) => {
            setQuery(value);
            setOpen(false);
          }}
        />
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
    const ref = useRef<HTMLDivElement | null>(null);

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
        <SizedBox width="20rem">
          <FormField title="Address">
            <TextInput
              boxRef={ref}
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(event) => setQuery(event.target.value)}
            />
          </FormField>
        </SizedBox>
        <Suggestions
          anchor={ref}
          open={open}
          onClose={() => setOpen(false)}
          suggestions={suggestions}
          onSelect={(value) => {
            setQuery(value);
            setOpen(false);
          }}
        />
        <DebugOverlay value={{ query, suggestions }} />
      </>
    );
  },
};

interface SuggestionsProps<T extends string | Identifiable> {
  anchor: MutableRefObject<HTMLDivElement | null>;
  width?: PopoverProps["width"];
  open: boolean;
  onClose: () => void;
  suggestions: T[];
  onSelect: (option: T) => void;
  isSelected?: (option: T) => boolean;
}

function Suggestions<T extends string | Identifiable>({
  anchor,
  onClose,
  open,
  suggestions,
  onSelect,
  isSelected = () => false,
}: SuggestionsProps<T>) {
  return (
    <Popover
      anchor={anchor}
      open={open}
      onClose={onClose}
      width="20rem"
      anchorOrigin={Origin.bottomLeft}
      transformOrigin={Origin.topLeft}
      scrollLock={false}
      autoFocus={false}
    >
      <Placeholder>
        <ScrollView width="100%" maxHeight="10rem">
          <Column>
            <Separate separator={<Divider />}>
              {suggestions.map((suggestion) => {
                const label = getLabel(suggestion);

                return (
                  <ListButton key={label} onClick={() => onSelect(suggestion)}>
                    <Row
                      width="100%"
                      gap="0.5rem"
                      justify="space-between"
                      align="center"
                    >
                      <Monospace noWrap>{label}</Monospace>
                      {isSelected(suggestion) ? <CheckIcon /> : undefined}
                    </Row>
                  </ListButton>
                );
              })}
            </Separate>
          </Column>
        </ScrollView>
      </Placeholder>
    </Popover>
  );
}

const ListButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.foreground.toString()};
  border: none;
  justify-content: flex-start;

  &:hover,
  &:active,
  &:focus {
    background-color: ${({ theme }) =>
      highlight(theme.colors.background).toString()};
  }
`;

function getLabel(option: string | Identifiable): string {
  return typeof option !== "string" ? option.id : option;
}
