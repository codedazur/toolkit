import {
  border,
  Column,
  ColumnProps,
  Placeholder,
} from "@codedazur/react-components";
import { Children, ReactNode } from "react";
import styled from "styled-components";

export const List = ({ children }: { children?: ReactNode }) => (
  <ListColumn gap="0.125rem">
    {Children.toArray(children).map((child, index) => (
      <Placeholder key={index} width="auto" height="auto" shape="rounded">
        {child}
      </Placeholder>
    ))}
  </ListColumn>
);

const ListColumn = styled(Column)<ColumnProps>`
  ${Placeholder}:first-child {
    ${border({ radius: { top: "0.75rem" } })}
  }

  ${Placeholder}:last-child {
    ${border({ radius: { bottom: "0.75rem" } })}
  }
`;
