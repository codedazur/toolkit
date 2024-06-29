import {
  Padding,
  Portal,
  Positioned,
  PositionedProps,
} from "@codedazur/react-components";
import { FunctionComponent, useEffect, useState } from "react";
import styled from "styled-components";
import YAML, { ScalarTag } from "yaml";
import { Monospace } from "./Monospace";

interface DebugOverlayProps {
  value: unknown;
}

export const DebugOverlay: FunctionComponent<DebugOverlayProps> = ({
  value,
}) => {
  const [yaml, setYaml] = useState<string>("");

  useEffect(() => {
    setYaml(
      YAML.stringify(value, {
        aliasDuplicateObjects: false,
        keepUndefined: true,
        customTags: [functionTag],
      }),
    );
  }, [value]);

  return (
    <Portal>
      <DebugBox left={0} top={0}>
        <Padding all="1rem">
          <Monospace>{yaml}</Monospace>
        </Padding>
      </DebugBox>
    </Portal>
  );
};

const DebugBox = styled(Positioned).attrs<PositionedProps>({
  mode: "fixed",
})<PositionedProps>`
  pointer-events: none;
  font-size: smaller;
  line-height: 1.5em;
  opacity: 0.75;
`;

const functionTag: ScalarTag = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  identify: (value: unknown): value is Function => value instanceof Function,
  tag: "!fn",
  resolve: (string) => {
    return new Function(string);
  },
  stringify: () => {
    return "Function";
  },
};
