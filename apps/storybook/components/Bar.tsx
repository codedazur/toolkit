import { Surface } from "@codedazur/fusion-ui";
import { ReactNode } from "react";

export const Bar = ({ children }: { children?: ReactNode }) => (
  <Surface
    shape="stadium"
    padding={{ horizontal: 400, vertical: 200 }}
    flex={{ align: "center", gap: 400 }}
  >
    {children}
  </Surface>
);
