import {
  Button as BaseButton,
  ButtonProps as BaseButtonProps,
  highlight,
} from "@codedazur/react-components";
import Color from "color";
import styled, { css, DefaultTheme } from "styled-components";

export interface ButtonProps extends BaseButtonProps {
  background?: keyof DefaultTheme["colors"] | Color;
  foreground?: keyof DefaultTheme["colors"] | Color;
}

export const Button = styled(BaseButton)<ButtonProps>(
  ({ theme, background = "primary", foreground }) => {
    const fg: Color | undefined =
      typeof foreground === "string" ? theme.colors[foreground] : foreground;

    const bg: Color =
      typeof background === "string" ? theme.colors[background]! : background;

    return css`
      color: ${(fg ?? highlight(bg, 1)).toString()};
      background-color: ${bg.toString()};
      border-color: ${bg.toString()};

      :focus,
      :active,
      :hover {
        background-color: ${highlight(bg).toString()};
        border-color: ${highlight(bg).toString()};
      }
    `;
  }
);
