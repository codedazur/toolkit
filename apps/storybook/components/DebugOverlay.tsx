import { Origin } from "@codedazur/essentials";
import { Box, ExpansionPanel, Popover, Text } from "@codedazur/fusion-ui";
import { FunctionComponent, useEffect, useState } from "react";
import YAML, { ScalarTag } from "yaml";

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

  const [expanded, setExpanded] = useState(true);

  return (
    <Popover
      open={true}
      anchor={{
        strategy: "fixed",
        parent: Origin.topLeft,
        child: Origin.topLeft,
        offset: { x: "1rem", y: "1rem" },
      }}
    >
      <ExpansionPanel
        title="Debug Panel"
        expanded={expanded}
        header={{ onClick: () => setExpanded(!expanded) }}
        opacity={500}
      >
        <Text
          as="pre"
          font={5}
          overflow="auto"
          constraints={{ maxHeight: 1000 }}
          style={{ fontSize: "12px", lineHeight: "1.5em" }}
        >
          {yaml}
        </Text>
      </ExpansionPanel>
    </Popover>
  );
};

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
