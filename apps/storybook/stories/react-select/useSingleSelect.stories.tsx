import {
  ArrowDropDownIcon,
  ArrowDropUpIcon,
  Button,
  CheckIcon,
  Column,
  Divider,
  EdgeInset,
  highlight,
  Identifiable,
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
  useSingleSelect,
  UseSingleSelectProps,
  useSuggestions,
} from "@codedazur/react-components";
import { faker } from "@faker-js/faker";
import { Meta, StoryObj } from "@storybook/react-vite";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { DebugOverlay } from "../../components/DebugOverlay";
import { Monospace } from "../../components/Monospace";

const defaultOptions = Array.from(
  new Set(Array.from({ length: 10 }).map(() => faker.commerce.product())),
);

export default {
  title: "React/Select/useSingleSelect",
  args: {
    options: defaultOptions,
  },
} as Meta<StoryArguments>;

type StoryArguments = UseSingleSelectProps<string>;

type Story = StoryObj<StoryArguments>;

export const Default: Story = {
  render: function Default({ options }) {
    const { isSelected, selected, select, toggle, deselect } = useSingleSelect({
      options,
    });

    return (
      <>
        <Column gap="1rem">
          <Separate separator={<Divider />}>
            {options.map((color, index) => (
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
    const ref = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);
    const { selected, isSelected, select } = useSingleSelect(args);

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
              <Monospace>{selected}</Monospace>
              <Padding all="0.25rem">
                {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
              </Padding>
            </Row>
          </EdgeInset>
        </InteractivePlaceholder>
        <Options
          anchor={ref}
          open={open}
          onClose={() => setOpen(false)}
          options={args.options}
          onSelect={(value) => {
            select(value);
            setOpen(false);
          }}
          isSelected={isSelected}
        />
        <DebugOverlay value={{ selected }} />
      </>
    );
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

export const WithInitialSelected: Story = {
  ...WithPopover,
  args: {
    initialSelected: defaultOptions[1],
  },
};

export const WithOptionGroups: StoryObj<
  Omit<StoryArguments, "options"> & { options: CategorizedOption[] }
> = {
  render: function WithOptiongroups({ options }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

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
                  ? `${selected?.id} (${selected?.category})`
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
                            onClick={() => {
                              select(option);
                              setOpen(false);
                            }}
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

export const WithSuggestions: Story = {
  render: function WithSuggestions(args) {
    const ref = useRef<HTMLInputElement | null>(null);
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
        <SizedBox width="20rem">
          <TextInput
            ref={ref}
            value={(query || selected) ?? ""}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              clear();
            }}
          />
        </SizedBox>
        <Options
          anchor={ref}
          open={open}
          onClose={() => setOpen(false)}
          options={suggestions}
          onSelect={(value) => {
            select(value);
            setOpen(false);
          }}
          isSelected={isSelected}
        />
        <DebugOverlay value={{ query, suggestions, selected }} />
      </>
    );
  },
};

interface CategorizedOption extends Identifiable {
  category: string;
}

interface OptionsProps<T extends string | Identifiable> {
  anchor: MutableRefObject<HTMLDivElement | null>;
  width?: PopoverProps["width"];
  open: boolean;
  onClose: () => void;
  options: T[];
  onSelect: (option: T) => void;
  isSelected?: (option: T) => boolean;
}

function Options<T extends string | Identifiable>({
  anchor,
  onClose,
  open,
  options,
  onSelect,
  isSelected = () => false,
}: OptionsProps<T>) {
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
              {options.map((option) => {
                const label = getLabel(option);

                return (
                  <ListButton key={label} onClick={() => onSelect(option)}>
                    <Row
                      width="100%"
                      gap="0.5rem"
                      justify="space-between"
                      align="center"
                    >
                      <Monospace noWrap>{label}</Monospace>
                      {isSelected(option) ? <CheckIcon /> : undefined}
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

function getLabel(option: string | Identifiable): string {
  return typeof option !== "string" ? option.id : option;
}
