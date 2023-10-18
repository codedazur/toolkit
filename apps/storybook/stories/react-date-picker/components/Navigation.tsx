import {
  ChevronLeftIcon,
  ChevronRightIcon,
  IconButton,
  Padding,
  Row,
} from "@codedazur/react-components";
import { FunctionComponent, MouseEventHandler } from "react";
import { Monospace } from "../../../components/Monospace";

interface NavigationProps {
  label?: string;
  onNextClick?: MouseEventHandler;
  onPreviousClick?: MouseEventHandler;
}

export const Navigation: FunctionComponent<NavigationProps> = ({
  label = "",
  onNextClick,
  onPreviousClick,
}) => (
  <Padding all="0.5rem">
    <Row justify="space-between" align="center">
      <IconButton onClick={onPreviousClick}>
        <ChevronLeftIcon />
      </IconButton>
      <Monospace>{label}</Monospace>
      <IconButton onClick={onNextClick}>
        <ChevronRightIcon />
      </IconButton>
    </Row>
  </Padding>
);
