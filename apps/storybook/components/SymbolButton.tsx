import styled from "styled-components";
import { Button } from "./Button";

export const SymbolButton = styled(Button).attrs((props) => ({
  background: "background",
  foreground: "foreground",
  ...props,
}))`
  width: 2rem;
  height: 2rem;
  padding: 0.125rem;
`;
