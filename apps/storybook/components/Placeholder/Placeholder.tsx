import { Surface, SurfaceProps } from "@codedazur/fusion-ui";
import { RecipeVariants } from "@vanilla-extract/recipes";
import { forwardRef } from "react";
import { placeholder } from "./Placeholder.css";

export type PlaceholderProps<T extends Element> = SurfaceProps<T> &
  RecipeVariants<typeof placeholder>;

export const Placeholder = forwardRef<Element, PlaceholderProps<Element>>(
  function Placeholder(
    {
      children,
      bordered = true,
      crossed = children === undefined,
      flex,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <Surface
        ref={ref}
        {...props}
        flex={{
          direction: "column",
          justify: "center",
          align: "center",
          gap: 200,
          ...flex,
        }}
        className={[placeholder({ bordered, crossed }), className]}
      >
        {children}
      </Surface>
    );
  },
);
