import { Padding, Portal, Positioned } from "@codedazur/react-components";
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
      })
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

const DebugBox = styled(Positioned).attrs({ mode: "fixed" })`
  pointer-events: none;
  font-size: smaller;
  line-height: 1.5em;
`;

const functionTag: ScalarTag = {
  identify: (value: unknown): value is Function => value instanceof Function,
  tag: "!fn",
  resolve: (string) => {
    return new Function(string);
  },
  stringify: (item, context) => {
    return "Function";
  },
};
