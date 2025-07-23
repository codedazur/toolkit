import {
  ArrowDropDownIcon,
  ArrowDropUpIcon,
  Button,
  CancelIcon,
  CheckIcon,
  Column,
  Divider,
  EdgeInset,
  Flex,
  highlight,
  IconButton,
  Opacity,
  Origin,
  Padding,
  Placeholder,
  Popover,
  PopoverProps,
  Row,
  ScrollView,
  Separate,
  ShapedBox,
  SizedBox,
  TextInput,
  useSuggestions,
  Wrap,
} from "@codedazur/react-components";
import { useSelect, UseSelectProps } from "@codedazur/react-select";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/react-vite";
import { MutableRefObject, ReactNode, useMemo, useRef, useState } from "react";
import { styled } from "styled-components";
import { DebugOverlay } from "../../components/DebugOverlay";
import { Monospace } from "../../components/Monospace";

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

interface Identifiable {
  [key: string]: unknown;
  id: string;
}

type Story = StoryObj<StoryArguments>;

type StoryArguments<T extends string | Identifiable = string> =
  UseSelectProps<T>;

export const Default: Story = {
  render: function Default(args) {
    const { isSelected, selected, select, toggle, deselect } = useSelect(args);

    return (
      <>
        <Column gap="1rem">
          <Separate separator={<Divider />}>
            {args.options.map((color, index) => (
              <Row key={index} gap="1rem">
                <Swatch color={color} />
                <Divider vertical />
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
  args: {
    options: ["olive", "orange", "crimson"],
  },
};

export const WithPopover: Story = {
  render: function WithPopover(args) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const { selected, isSelected, toggle } = useSelect(args);

    return (
      <>
        <InteractivePlaceholder
          ref={ref}
          width="20rem"
          height="auto"
          onFocus={() => setOpen(true)}
        >
          <EdgeInset all="0.25rem" left="1rem">
            <Row width="100%" justify="space-between" align="center">
              <Monospace>{selected.join(", ")}</Monospace>
              <Padding all="0.25rem">
                {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
              </Padding>
            </Row>
          </EdgeInset>
        </InteractivePlaceholder>
        <Options
          width="20rem"
          anchor={ref}
          open={open}
          onClose={() => setOpen(false)}
          options={args.options}
          onSelect={toggle}
          isSelected={isSelected}
        />
        <DebugOverlay value={{ selected }} />
      </>
    );
  },
};

export const WithInitialSelected: Story = {
  ...WithPopover,
  args: {
    ...WithPopover.args,
    initialSelected: defaultOptions.slice(2, 4),
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
    const ref = useRef<HTMLDivElement | null>(null);

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
        <InteractivePlaceholder
          ref={ref}
          width="20rem"
          height="auto"
          onFocus={() => setOpen(true)}
        >
          <EdgeInset all="0.25rem" left="1rem">
            <Row width="100%" justify="space-between" align="center">
              <Monospace>
                {selected
                  ? selected
                      .map(
                        (selected) => `${selected?.id} (${selected?.category})`,
                      )
                      .join(", ")
                  : undefined}
              </Monospace>
              <Padding all="0.25rem">
                {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
              </Padding>
            </Row>
          </EdgeInset>
        </InteractivePlaceholder>
        <Popover
          anchor={ref}
          open={open}
          onClose={() => setOpen(false)}
          width="20rem"
          maxHeight="10rem"
          anchorOrigin={Origin.bottomLeft}
          transformOrigin={Origin.topLeft}
          scrollLock={false}
          autoFocus={false}
        >
          <Placeholder>
            <ScrollView width="100%" maxHeight="20rem">
              <Column>
                <Separate separator={<Divider />}>
                  {Object.entries(groupedOptions).map(([category, options]) => (
                    <Column key={category}>
                      <Separate separator={<Divider />}>
                        <Opacity opacity={0.5}>
                          <Padding horizontal="1rem" vertical="0.5rem">
                            <Monospace>{category}</Monospace>
                          </Padding>
                        </Opacity>
                        {options.map((option) => (
                          <ListButton
                            key={option.id}
                            onClick={() => toggle(option)}
                          >
                            <Row
                              width="100%"
                              gap="0.5rem"
                              justify="space-between"
                              align="center"
                            >
                              <Padding left="1rem">
                                <Monospace noWrap>{option.id}</Monospace>
                              </Padding>
                              {isSelected(option) ? <CheckIcon /> : undefined}
                            </Row>
                          </ListButton>
                        ))}
                      </Separate>
                    </Column>
                  ))}
                </Separate>
              </Column>
            </ScrollView>
          </Placeholder>
        </Popover>
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

const InteractivePlaceholder = styled(Placeholder).attrs({ tabIndex: 1 })`
  &:hover,
  &:active,
  &:focus {
    cursor: pointer;
    background-color: ${({ theme }) =>
      highlight(theme.colors.background).toString()};
  }
`;

export const WithSuggestions: Story = {
  render: function WithSuggestions(args) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    const { suggestions, query, setQuery } = useSuggestions(args);
    const { selected, isSelected, deselect, toggle } = useSelect(args);

    return (
      <>
        <SizedBox width="20rem">
          <TextInput
            boxRef={ref}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(event) => setQuery(event.target.value)}
            leading={<Chips selected={selected} deselect={deselect} />}
          />
        </SizedBox>
        <Options
          anchor={ref}
          open={open}
          onClose={() => setOpen(false)}
          options={suggestions}
          onSelect={toggle}
          isSelected={isSelected}
        />
        <DebugOverlay value={{ query, suggestions, selected }} />
      </>
    );
  },
};

interface OptionsProps<T extends string | Identifiable> {
  anchor: MutableRefObject<HTMLDivElement | null>;
  width?: PopoverProps["width"];
  open: boolean;
  onClose: () => void;
  options: T[];
  onSelect: (suggestion: T) => void;
  isSelected: (suggestion: T) => boolean;
}

function Options<T extends string | Identifiable>({
  anchor,
  width = "20rem",
  onClose,
  open,
  options: options,
  onSelect,
  isSelected,
}: OptionsProps<T>) {
  return (
    <Popover
      anchor={anchor}
      open={open}
      onClose={onClose}
      width={width}
      anchorOrigin={Origin.bottomLeft}
      transformOrigin={Origin.topLeft}
      scrollLock={false}
      autoFocus={false}
    >
      <Placeholder>
        <ScrollView width="100%" maxHeight="10rem">
          <Column>
            <Separate separator={<Divider />}>
              {options.map((suggestion) => {
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

const Swatch = styled(ShapedBox).attrs({
  shape: "square",
  height: "2.5rem",
  width: "2.5rem",
})<{ color: string }>`
  background-color: ${({ color }) => color};
`;

interface ChipsProps<T extends string | Identifiable> {
  selected: T[];
  deselect: (value: T) => void;
  renderOption?: (option: T) => ReactNode;
}

const Chips = <T extends string | Identifiable>({
  selected,
  deselect,
  renderOption = getLabel,
}: ChipsProps<T>) =>
  selected.length > 0 ? (
    <Flex align="center">
      <Padding all="0.25rem">
        <Wrap gap="0.25rem" align="center">
          {selected.map((option) => (
            <Placeholder
              key={getLabel(option)}
              width="auto"
              height="auto"
              shape="stadium"
            >
              <Padding left="0.5rem" right="0.125rem">
                <Row align="center" gap="0.25rem">
                  <Monospace noWrap>{renderOption(option)}</Monospace>
                  <IconButton onClick={() => deselect(option)}>
                    <CancelIcon size="small" />
                  </IconButton>
                </Row>
              </Padding>
            </Placeholder>
          ))}
        </Wrap>
      </Padding>
    </Flex>
  ) : null;

function getLabel(option: string | Identifiable): string {
  return typeof option !== "string" ? option.id : option;
}
