import { Icon, IconButton, Row, Text } from "@codedazur/fusion-ui";
import { FunctionComponent, MouseEventHandler } from "react";

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
  <Row justify="between" align="center" padding={200}>
    <IconButton icon={Icon.ChevronLeft} onClick={onPreviousClick} />
    <Text variant="label">{label}</Text>
    <IconButton icon={Icon.ChevronRight} onClick={onNextClick} />
  </Row>
);
