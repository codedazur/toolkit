import {
  Box,
  Button,
  Chip,
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
  useSelect,
  UseSelectProps,
  useSuggestions,
} from "@codedazur/react-select";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";

const defaultOptions = Array.from(
  new Set(Array.from({ length: 10 }).map(() => faker.commerce.product())),
);

/**
 * @todo Clean up some duplicate code.
 */

export default {
  title: "React/Select/useSelect",
  args: {
    options: defaultOptions,
    initialSelected: [],
  },
} as Meta;

type Story = StoryObj<StoryArguments>;

type StoryArguments<T extends string | Identifiable = string> =
  UseSelectProps<T>;

export const Default: Story = {
  args: {
    options: ["olive", "orange", "crimson"],
  },
  render: function Default(args) {
    const { isSelected, selected, select, toggle, deselect } = useSelect(args);

    return (
      <>
        <Column gap={400}>
          <Separate separator={<Divider />}>
            {args.options.map((color, index) => (
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
        <DebugOverlay
          value={{ selected: selected.map((color) => color.toString()) }}
        />
      </>
    );
  },
};

export const WithPopover: Story = {
  render: function WithPopover(args) {
    const [open, setOpen] = useState(false);
    const { selected, toggle, isSelected } = useSelect(args);

    return (
      <>
        <Box position="relative">
          <Surface
            size={{ width: 800 }}
            onClick={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            padding={400}
          >
            <Row justify="between" align="center">
              <Text variant="label">{selected.join(", ")}</Text>
              {open ? <Icon.ArrowDropUp /> : <Icon.ArrowDropDown />}
            </Row>
          </Surface>
          <PopoverMenu
            fit="parent"
            open={open}
            onClose={() => setOpen(false)}
            menu={{
              items: args.options.map((option) => ({
                label: option,
                onClick: () => toggle(option),
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
  render: function WithOptionGroups({ options }) {
    const [open, setOpen] = useState(false);

    const { toggle, selected, isSelected } = useSelect<CategorizedOption>({
      options,
    });

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
            size={{ width: 800 }}
            onClick={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            padding={400}
          >
            <Row justify="between" align="center">
              <Text variant="label">
                {selected
                  ? selected
                      .map(
                        (selected) => `${selected?.id} (${selected?.category})`,
                      )
                      .join(", ")
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
                        onClick: () => toggle(option),
                        trailing: isSelected(option) ? (
                          <Icon.Check />
                        ) : undefined,
                      }) as const,
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

    const { suggestions, query, setQuery } = useSuggestions(args);
    const { selected, isSelected, toggle } = useSelect(args);

    return (
      <>
        <Box position="relative">
          <Input
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(event) => setQuery(event.target.value)}
            leading={
              <Row gap={200}>
                {selected.map((option) => (
                  <Chip key={option} label={option} />
                ))}
              </Row>
            }
          />
          <PopoverMenu
            fit="parent"
            open={open}
            onClose={() => setOpen(false)}
            menu={{
              items: suggestions.map((suggestion) => ({
                label: suggestion,
                onClick: () => toggle(suggestion),
                trailing: isSelected(suggestion) ? "✓" : undefined,
              })),
            }}
          />
        </Box>
        <DebugOverlay value={{ query, suggestions, selected }} />
      </>
    );
  },
};
