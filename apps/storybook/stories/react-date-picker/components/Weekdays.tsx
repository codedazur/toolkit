import { Grid, Text } from "@codedazur/fusion-ui";
import { UseDatePickerResult } from "@codedazur/react-date-picker";
import { FunctionComponent } from "react";

interface WeekdaysProps {
  weekdays: UseDatePickerResult["month"]["weekdays"];
}

export const Weekdays: FunctionComponent<WeekdaysProps> = ({ weekdays }) => (
  <Grid style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
    {weekdays.map(({ label }, index) => (
      <Grid.Item key={index} padding={{ vertical: 200 }}>
        <Text variant="label" align="center">
          {label}
        </Text>
      </Grid.Item>
    ))}
  </Grid>
);
