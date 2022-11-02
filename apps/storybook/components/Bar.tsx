import { Padding, Placeholder, Row } from "@codedazur/react-components";
import { ReactNode } from "react";

export const Bar = ({ children }: { children?: ReactNode }) => (
  <Placeholder width="auto" height="auto" shape="stadium">
    <Padding horizontal="1rem" vertical="0.5rem">
      <Row align="center" gap="1rem">
        {children}
      </Row>
    </Padding>
  </Placeholder>
);
