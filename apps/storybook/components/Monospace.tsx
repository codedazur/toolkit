import { Text } from "@codedazur/react-components";
import styled from "styled-components";

export const Monospace = styled(Text).attrs({
  as: "pre",
})`
  font-family: monospace;
  white-space: pre-wrap;
`;
