import {
  Box,
  Button,
  Column,
  Divider,
  Icon,
  Input,
  PopoverMenu,
  Row,
  Separate,
  Surface,
  Text,
} from "@codedazur/fusion-ui";
import {
  Identifiable,
  useSingleSelect,
  UseSingleSelectProps,
  useSuggestions,
} from "@codedazur/react-select";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useMemo, useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";

const defaultOptions = Array.from(
  new Set(Array.from({ length: 10 }).map(() => faker.commerce.product())),
);

export default {
  title: "React/Select/useSingleSelect",
  args: {
    options: defaultOptions,
  },
} as Meta<StoryArguments>;

type StoryArguments<T extends string | Identifiable = string> =
  UseSingleSelectProps<T>;

type Story = StoryObj<StoryArguments>;

export const Default: Story = {
  render: function Default({ options }) {
    const { isSelected, selected, select, toggle, deselect } = useSingleSelect({
      options,
    });

    return (
      <>
        <Column gap={400}>
          <Separate separator={<Divider />}>
            {options.map((color, index) => (
              <Row key={index} gap={400}>
                <Surface size={250} style={{ backgroundColor: color }} />
                <Divider orientation="vertical" />
                <Button onClick={() => toggle(color)}>Toggle</Button>
                <Button
                  onClick={() => select(color)}
                  disabled={isSelected(color)}
                >
                  Select
                </Button>
                <Button
                  onClick={() => deselect(color)}
                  disabled={!isSelected(color)}
                >
                  Deselect
                </Button>
              </Row>
            ))}
          </Separate>
        </Column>
        <DebugOverlay value={{ selected }} />
      </>
    );
  },
  args: {
    options: ["olive", "orange", "crimson"],
  },
};

export const WithPopover: Story = {
  render: function WithPopover(args) {
    const [open, setOpen] = useState(false);
    const { selected, select, isSelected } = useSingleSelect(args);

    return (
      <>
        <Box position="relative">
          <Surface
            onClick={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            padding={400}
            size={{ width: 800 }}
          >
            <Row justify="between" align="center">
              <Text variant="label">{selected}</Text>
              {open ? <Icon.ArrowDropUp /> : <Icon.ArrowDropDown />}
            </Row>
          </Surface>
          <PopoverMenu
            open={open}
            onClose={() => setOpen(false)}
            fit="parent"
            menu={{
              items: args.options.map((option) => ({
                label: option,
                onClick: () => {
                  select(option);
                  setOpen(false);
                },
                trailing: isSelected(option) ? <Icon.Check /> : undefined,
              })),
            }}
          />
        </Box>
        <DebugOverlay value={{ selected }} />
      </>
    );
  },
};

interface CategorizedOption extends Identifiable {
  category: string;
}

export const WithOptionGroups: StoryObj<
  Omit<StoryArguments, "options"> & { options: CategorizedOption[] }
> = {
  render: function WithOptiongroups({ options }) {
    const [open, setOpen] = useState(false);

    const { select, selected, isSelected } = useSingleSelect<CategorizedOption>(
      {
        options,
      },
    );

    const groupedOptions = useMemo(
      () =>
        options.reduce(
          (result: Record<string, CategorizedOption[]>, suggestion) => {
            if (!result[suggestion.category]) {
              result[suggestion.category] = [];
            }
            result[suggestion.category].push(suggestion);
            return result;
          },
          {},
        ),
      [options],
    );

    return (
      <>
        <Box position="relative">
          <Surface
            onClick={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            padding={400}
            size={{ width: 800 }}
          >
            <Row justify="between" align="center">
              <Text variant="label">
                {selected
                  ? `${selected?.id} (${selected?.category})`
                  : undefined}
              </Text>
              {open ? <Icon.ArrowDropUp /> : <Icon.ArrowDropDown />}
            </Row>
          </Surface>
          <PopoverMenu
            fit="parent"
            open={open}
            onClose={() => setOpen(false)}
            menu={{
              items: Object.entries(groupedOptions).flatMap(
                ([category, options]) => [
                  {
                    label: category,
                    pointerEvents: "none",
                    opacity: 500,
                  },
                  ...options.map(
                    (option) =>
                      ({
                        padding: { left: 800 },
                        label: option.id,
                        onClick: () => {
                          select(option);
                          setOpen(false);
                        },
                        trailing: isSelected(option) ? (
                          <Icon.Check />
                        ) : undefined,
                      } as const),
                  ),
                ],
              ),
            }}
          />
        </Box>
        <DebugOverlay value={{ selected }} />
      </>
    );
  },
  args: {
    options: Array.from({ length: 3 })
      .map(() => {
        const category = faker.commerce.department();
        return Array.from({ length: 3 }).map(() => ({
          category,
          id: faker.commerce.product(),
        }));
      })
      .flat(),
  },
};

export const WithSuggestions: Story = {
  render: function WithSuggestions(args) {
    const [open, setOpen] = useState(false);

    const { query, setQuery, suggestions } = useSuggestions(args);
    const { selected, isSelected, select, clear } = useSingleSelect(args);

    useEffect(() => {
      if (!open) {
        setQuery("");
      }
    }, [open, setQuery]);

    return (
      <>
        <Box position="relative">
          <Input
            size={{ width: 800 }}
            value={query || selected || ""}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              if (selected) clear();
            }}
          />
          <PopoverMenu
            fit="parent"
            open={open && suggestions.length > 0}
            onClose={() => setOpen(false)}
            menu={{
              items: suggestions.map((suggestion) => ({
                label: suggestion,
                onClick: () => {
                  select(suggestion);
                  setOpen(false);
                },
                trailing: isSelected(suggestion) ? <Icon.Check /> : undefined,
              })),
            }}
          />
        </Box>
        <DebugOverlay value={{ query, suggestions, selected }} />
      </>
    );
  },
};
