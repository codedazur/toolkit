import {
  Button,
  ChevronLeftIcon,
  ChevronRightIcon,
  Column,
  IconButton,
  Origin,
  Placeholder,
  Popover,
  Row,
  SizedBox,
} from "@codedazur/react-components";
import {
  UseSingleDatePickerProps,
  useSingleDatePicker,
} from "@codedazur/react-date-picker";
import { Meta } from "@storybook/react";
import docs from "./useSingleDatePicker.docs.mdx";
import { addDays, Day } from "date-fns";
import { enGB, enUS, es, nl, ru } from "date-fns/locale";
import { FunctionComponent, useMemo, useRef, useState } from "react";
import { Weekdays } from "./components/Weekdays";
import { Days } from "./components/Days";
import { Navigation } from "./components/Navigation";
import { Monospace } from "../../components/Monospace";

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
const defaultArgTypes = {
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
};

const meta: Meta = {
  title: "React Date Picker/useSingleDatePicker",
  parameters: {
    docs: {
      page: docs,
    },
  },
  args: {
    showExternalDays: true,
    autoProgressMonth: false,
  },
};
export default meta;

export const Default = (args: UseSingleDatePickerProps) => (
  <DatePicker {...args} />
);
Default.argTypes = defaultArgTypes;

export const WithLimits = (args: UseSingleDatePickerProps) => {
  return (
    <DatePicker
      {...args}
      minDate={new Date()}
      maxDate={addDays(new Date(), 7)}
    />
  );
};
WithLimits.argTypes = defaultArgTypes;

export const WithDisabledDates = (args: UseSingleDatePickerProps) => {
  return (
    <DatePicker
      {...args}
      isDateDisabled={(date: Date) =>
        date.getDate() === 16 || [0, 6].includes(date.getDay())
      }
    />
  );
};
WithDisabledDates.argTypes = defaultArgTypes;

export const Localized = (args: UseSingleDatePickerProps) => {
  return <DatePicker {...args} locale={es} />;
};
Localized.argTypes = defaultArgTypes;

export const CustomFormatting = (args: UseSingleDatePickerProps) => {
  return (
    <DatePicker
      {...args}
      dayLabelFormat="d."
      weekdayLabelFormat="eeeee"
      monthLabelFormat="MMM. yyyy"
    />
  );
};
CustomFormatting.argTypes = defaultArgTypes;

export const CustomFormattingFunction = (args: UseSingleDatePickerProps) => {
  const dayLabelFormat = (date: Date) =>
    [12, 16].includes(date.getDate()) ? "😄" : date.getDate().toString();

  const weekdayLabelFormat = (date: Date) =>
    ["S", "Mon", "Tue", "Wed", "Thu", "Fri", "S"][date.getDay()];

  const monthLabelFormat = (date: Date) =>
    `Q${Math.ceil((date.getMonth() + 1) / 3)}-${
      (date.getMonth() % 3) + 1
    } ${date.getFullYear()}`;

  return (
    <DatePicker
      {...args}
      dayLabelFormat={dayLabelFormat}
      weekdayLabelFormat={weekdayLabelFormat}
      monthLabelFormat={monthLabelFormat}
    />
  );
};
CustomFormattingFunction.argTypes = defaultArgTypes;

export const InPopover = (args: UseSingleDatePickerProps) => {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <Button ref={anchor} onClick={() => setOpen(true)}>
        Open DatePicker
      </Button>
      <Popover
        open={open}
        anchor={anchor}
        anchorOrigin={Origin.bottomLeft}
        transformOrigin={Origin.topLeft}
        onClose={() => setOpen(false)}
      >
        <Placeholder>
          <DatePicker {...args} />
        </Placeholder>
      </Popover>
    </>
  );
};

export const ForTwoMonths = (args: UseSingleDatePickerProps) => {
  const { month, getMonth, toPreviousMonth, toNextMonth } =
    useSingleDatePicker(args);

  const months = useMemo(() => [month, getMonth(1)], [month, getMonth]);

  return (
    <Row gap="2rem">
      <IconButton onClick={toPreviousMonth}>
        <ChevronLeftIcon />
      </IconButton>
      {months.map((month, index) => (
        <SizedBox key={index} width="20rem">
          <Column gap="0.5rem">
            <Monospace align="center">{month.label}</Monospace>
            <Weekdays weekdays={month.weekdays} />
            <Days days={month.days} />
          </Column>
        </SizedBox>
      ))}
      <IconButton onClick={toNextMonth}>
        <ChevronRightIcon />
      </IconButton>
    </Row>
  );
};
ForTwoMonths.args = {
  showExternalDays: true,
};

const DatePicker: FunctionComponent<UseSingleDatePickerProps> = (args) => {
  const { month, toNextMonth, toPreviousMonth } = useSingleDatePicker(args);

  return (
    <SizedBox width="20rem">
      <Column gap="0.5rem">
        <Navigation
          label={month.label}
          onNextClick={toNextMonth}
          onPreviousClick={toPreviousMonth}
        />
        <Weekdays weekdays={month.weekdays} />
        <Days days={month.days} />
      </Column>
    </SizedBox>
  );
};
