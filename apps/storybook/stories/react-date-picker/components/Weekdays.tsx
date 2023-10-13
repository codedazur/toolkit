import {
  EdgeInset,
  Expanded,
  Grid,
  GridItem,
  UseDatePickerResult,
} from "@codedazur/react-components";
import { FunctionComponent } from "react";
import { Monospace } from "../../../components/Monospace";

interface WeekdaysProps {
  weekdays: UseDatePickerResult["month"]["weekdays"];
}

export const Weekdays: FunctionComponent<WeekdaysProps> = ({ weekdays }) => (
  <Grid columns={7}>
    {weekdays.map(({ label }, index) => (
      <GridItem key={index}>
        <EdgeInset vertical="0.5rem">
          <Expanded>
            <Monospace align="center">{label}</Monospace>
          </Expanded>
        </EdgeInset>
      </GridItem>
    ))}
  </Grid>
);
