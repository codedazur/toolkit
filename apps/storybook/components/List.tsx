import { ShapedBox, Column, Placeholder } from "@codedazur/react-components";
import { ReactNode, Children } from "react";

export const List = ({ children }: { children?: ReactNode }) => (
  <ShapedBox shape="stadium" style={{ borderRadius: "0.75rem" }}>
    <Column gap="0.125rem">
      {Children.toArray(children).map((child, index) => (
        <Placeholder key={index} width="auto" height="auto" shape="rounded">
          {child}
        </Placeholder>
      ))}
    </Column>
  </ShapedBox>
);
