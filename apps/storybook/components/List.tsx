import { Column, Surface } from "@codedazur/fusion-ui";
import { Children, ReactNode } from "react";

export const List = ({ children }: { children?: ReactNode }) => (
  <Column gap={150} border={{ radius: 400 }} overflow="hidden">
    {Children.toArray(children).map((child, index) => (
      <Surface key={index}>{child}</Surface>
    ))}
  </Column>
);
