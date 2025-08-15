import { Origin } from "@codedazur/essentials";
import {
  Box,
  Button,
  Column,
  Divider,
  IconButton,
  Popover,
  Row,
  Separate,
  Surface,
  Text,
} from "@codedazur/fusion-ui";
import {
  UseDatePickerProps,
  useDatePicker,
} from "@codedazur/react-date-picker";
import { Meta, StoryObj } from "@storybook/react-vite";
import { Day, Locale } from "date-fns";
import { enGB, enUS, es, nl, ru } from "date-fns/locale";
import { FunctionComponent, useMemo, useRef, useState } from "react";
import { DebugOverlay } from "../../components/DebugOverlay";
import { Days } from "./components/Days";
import { Navigation } from "./components/Navigation";
import { Weekdays } from "./components/Weekdays";
import { Icon } from "../../components/Icon";

const DatePicker: FunctionComponent<UseDatePickerProps> = (props) => {
  const { cursor, dates, month, toNextMonth, toPreviousMonth } =
    useDatePicker(props);

  return (
    <>
      <Box size={{ width: 800 }}>
        <Column gap={200}>
          <Navigation
            label={month.label}
            onNextClick={toNextMonth}
            onPreviousClick={toPreviousMonth}
          />
          <Weekdays weekdays={month.weekdays} />
          <Days days={month.days} />
        </Column>
      </Box>
      <DebugOverlay value={{ cursor, dates }} />
    </>
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

const meta: Meta<UseDatePickerProps> = {
  title: "React/DatePicker/useDatePicker",
  component: DatePicker,
  argTypes: {
    subsequentDates: {
      control: { type: "select" },
      options: ["clear", "shift", "keep"],
    },
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
    count: {
      control: { type: "number" },
    },
    minDuration: {
      control: { type: "number" },
    },
    maxDuration: {
      control: { type: "number" },
    },
    locale: {
      control: { type: "select" },
      options: Object.keys(localeMap),
      mapping: localeMap,
    },
  },
  args: {
    count: 2,
    showExternalDays: true,
    autoProgressMonth: false,
    autoProgressCursor: true,
    enforceChronologicalOrder: true,
    subsequentDates: "clear",
  },
};

export default meta;

type Story = StoryObj<UseDatePickerProps>;

export const Default: Story = {};

export const WithDurationLimits: Story = {
  args: {
    minDuration: 4,
    maxDuration: 7,
  },
};

export const Localized: Story = {
  args: {
    locale: es,
  },
};

export const InPopover: Story = {
  render: function InPopover(args) {
    const [open, setOpen] = useState(false);
    const anchor = useRef<HTMLButtonElement | null>(null);

    return (
      <Box position="relative">
        <Button ref={anchor} onClick={() => setOpen(true)}>
          Open DatePicker
        </Button>
        <Popover
          anchor={{ parent: Origin.top, child: Origin.bottom }}
          open={open}
          onClose={() => setOpen(false)}
        >
          <Surface>
            <DatePicker {...args} />
          </Surface>
        </Popover>
      </Box>
    );
  },
};

export const ForMultipleMonths: Story = {
  render: function ForMultipleMonths(args) {
    const { cursor, dates, month, getMonth, toNextMonth, toPreviousMonth } =
      useDatePicker(args);

    const months = useMemo(
      () => [getMonth(-1), month, getMonth(1)],
      [month, getMonth],
    );

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
        <DebugOverlay value={{ cursor, dates }} />
      </>
    );
  },
  args: {
    showExternalDays: true,
  },
};

export const WeekendDeals: Story = {
  args: {
    minDuration: 2,
    maxDuration: 3,
    isDateDisabled: (date, cursor) =>
      cursor === 0 ? ![5, 6].includes(date.getDay()) : false,
  },
};

export const ControlledProgression: Story = {
  render: function ControlledProgression(args) {
    const { cursor, setCursor, dates, month, toPreviousMonth, toNextMonth } =
      useDatePicker(args);

    return (
      <>
        <Box size={{ width: 800 }}>
          <Column gap={200}>
            <Separate separator={<Divider />}>
              <Row justify="between">
                <Row gap={100}>
                  <IconButton
                    onClick={() => setCursor(0)}
                    disabled={cursor === 0}
                    icon={
                      <Icon>
                        <path d="M2.5,19h19v2h-19V19z M22.07,9.64c-0.21-0.8-1.04-1.28-1.84-1.06L14.92,10l-6.9-6.43L6.09,4.08l4.14,7.17l-4.97,1.33 l-1.97-1.54l-1.45,0.39l2.59,4.49c0,0,7.12-1.9,16.57-4.43C21.81,11.26,22.28,10.44,22.07,9.64z" />
                      </Icon>
                    }
                  />
                  <IconButton
                    onClick={() => setCursor(1)}
                    disabled={cursor === 1}
                    icon={
                      <Icon>
                        <path d="M2.5,19h19v2h-19V19z M19.34,15.85c0.8,0.21,1.62-0.26,1.84-1.06c0.21-0.8-0.26-1.62-1.06-1.84l-5.31-1.42l-2.76-9.02 L10.12,2v8.28L5.15,8.95L4.22,6.63L2.77,6.24v5.17L19.34,15.85z" />
                      </Icon>
                    }
                  />
                </Row>
                <IconButton
                  icon={Icon.Backspace}
                  onClick={() => setCursor(0)}
                />
              </Row>
              <Column gap={200}>
                <Navigation
                  label={month.label}
                  onNextClick={toNextMonth}
                  onPreviousClick={toPreviousMonth}
                />
                <Weekdays weekdays={month.weekdays} />
                <Days days={month.days} />
              </Column>
            </Separate>
          </Column>
        </Box>
        <DebugOverlay value={{ cursor, dates }} />
      </>
    );
  },
  args: {
    autoProgressCursor: false,
    subsequentDates: "keep",
  },
};
