import { Origin } from "@codedazur/essentials";
import {
  Box,
  Button,
  Column,
  IconButton,
  Popover,
  Row,
  Surface,
  Text,
} from "@codedazur/fusion-ui";
import {
  UseSingleDatePickerProps,
  UseSingleDatePickerResult,
  useSingleDatePicker,
} from "@codedazur/react-date-picker";
import { Meta, StoryObj } from "@storybook/nextjs";
import { Day, Locale, addDays } from "date-fns";
import { enGB, enUS, es, nl, ru } from "date-fns/locale";
import { FunctionComponent, useMemo, useRef, useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";
import { Icon } from "../../components/Icon";
import { Days } from "./components/Days";
import { Navigation } from "./components/Navigation";
import { Weekdays } from "./components/Weekdays";

const DatePicker: FunctionComponent<UseSingleDatePickerResult> = ({
  month,
  toNextMonth,
  toPreviousMonth,
}) => {
  return (
    <Column gap={400}>
      <Navigation
        label={month.label}
        onNextClick={toNextMonth}
        onPreviousClick={toPreviousMonth}
      />
      <Weekdays weekdays={month.weekdays} />
      <Days days={month.days} />
    </Column>
  );
};

const localeMap: Record<string, Locale> = {
  "en-US": enUS,
  "en-GB": enGB,
  nl,
  es,
  ru,
};

const weekStartsOnMap: Record<string, Day> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const meta: Meta<UseSingleDatePickerProps> = {
  title: "React/DatePicker/useSingleDatePicker",
  argTypes: {
    weekStartsOn: {
      control: { type: "select" },
      options: Object.keys(weekStartsOnMap),
      mapping: weekStartsOnMap,
    },
    minDate: {
      control: { type: "date" },
    },
    maxDate: {
      control: { type: "date" },
    },
    locale: {
      control: { type: "select" },
      options: Object.keys(localeMap),
      mapping: localeMap,
    },
  },
  args: {
    showExternalDays: true,
    autoProgressMonth: false,
  },
};

export default meta;

type Story = StoryObj<UseSingleDatePickerProps>;

export const Default: Story = {
  render: function Default(args) {
    const props = useSingleDatePicker(args);

    return (
      <>
        <DatePicker {...props} />
        <DebugOverlay value={props} />
      </>
    );
  },
};

export const WithLimits: Story = {
  args: {
    minDate: new Date(),
    maxDate: addDays(new Date(), 7),
  },
};

export const WithDisabledDates: Story = {
  args: {
    isDateDisabled: (date: Date) =>
      date.getDate() === 16 || [0, 6].includes(date.getDay()),
  },
};

export const Localized: Story = {
  args: {
    locale: es,
  },
};

export const CustomFormatting: Story = {
  args: {
    dayLabelFormat: "d.",
    weekdayLabelFormat: "eeeee",
    monthLabelFormat: "MMM. yyyy",
  },
};

export const CustomFormattingFunction: Story = {
  render: function CustomFormattingFunction(args) {
    const dayLabelFormat = (date: Date) =>
      [12, 16].includes(date.getDate()) ? "😄" : date.getDate().toString();

    const weekdayLabelFormat = (date: Date) =>
      ["S", "Mon", "Tue", "Wed", "Thu", "Fri", "S"][date.getDay()];

    const monthLabelFormat = (date: Date) =>
      `Q${Math.ceil((date.getMonth() + 1) / 3)}-${
        (date.getMonth() % 3) + 1
      } ${date.getFullYear()}`;

    const props = useSingleDatePicker({
      ...args,
      dayLabelFormat,
      weekdayLabelFormat,
      monthLabelFormat,
    });

    return (
      <>
        <DatePicker {...props} />
        <DebugOverlay value={props} />
      </>
    );
  },
};

export const InPopover: Story = {
  render: function InPopover(args) {
    const [open, setOpen] = useState(false);
    const anchor = useRef<HTMLButtonElement | null>(null);
    const props = useSingleDatePicker(args);

    return (
      <>
        <Box position="relative">
          <Button ref={anchor} onClick={() => setOpen(true)}>
            Open DatePicker
          </Button>
          <Popover
            anchor={{
              parent: Origin.top,
              child: Origin.bottom,
              offset: { y: "-1rem" },
            }}
            open={open}
            onClose={() => setOpen(false)}
          >
            <Surface padding={200}>
              <DatePicker {...props} />
            </Surface>
          </Popover>
        </Box>
        <DebugOverlay value={props} />
      </>
    );
  },
};

export const ForMultipleMonths: Story = {
  render: function ForMultipleMonths(args) {
    const { month, getMonth, toPreviousMonth, toNextMonth, ...rest } =
      useSingleDatePicker(args);

    const months = useMemo(() => [month, getMonth(1)], [month, getMonth]);

    return (
      <>
        <Row gap={200}>
          <IconButton icon={Icon.ChevronLeft} onClick={toPreviousMonth} />
          {months.map((month, index) => (
            <Column key={index} size={{ width: 800 }} gap={200}>
              <Text variant="label" align="center">
                {month.label}
              </Text>
              <Weekdays weekdays={month.weekdays} />
              <Days days={month.days} />
            </Column>
          ))}
          <IconButton icon={Icon.ChevronRight} onClick={toNextMonth} />
        </Row>
        <DebugOverlay value={{ month, ...rest }} />
      </>
    );
  },
  args: {
    showExternalDays: true,
  },
};
