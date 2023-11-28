import { transparent } from "@codedazur/react-components";
import styled, { css } from "styled-components";

interface DayProps {
  isInActiveMonth: boolean;
  isInSelectedRange: boolean;
  isInFocusedRange: boolean;
  isSelected: boolean;
  isFirstDate: boolean;
  isLastDate: boolean;
}

export const Day = styled.button.attrs<DayProps>((props) => ({
  background: props.isSelected ? "primary" : transparent,
  foreground: "foreground",
  ...props,
}))<DayProps>`
  position: relative;
  width: 100%;
  padding: 0.25rem;
  transition: 0.2s;
  border: none;
  border-radius: 50%;

  ${({ theme, isFirstDate, isLastDate, isInFocusedRange, isInSelectedRange }) =>
    (isFirstDate || isLastDate || isInFocusedRange || isInSelectedRange) &&
    css`
      :before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background-color: ${theme.colors.primary.alpha(0.25).toString()};

        ${isFirstDate &&
        css`
          border-top-left-radius: 50%;
          border-bottom-left-radius: 50%;
        `}

        ${isLastDate &&
        css`
          border-top-right-radius: 50%;
          border-bottom-right-radius: 50%;
        `}
      }
    `}

  ${({ isInSelectedRange }) =>
    !isInSelectedRange &&
    css`
      :hover {
        :before {
          border-top-right-radius: 50%;
          border-bottom-right-radius: 50%;
        }
      }
    `}

  ${({ isInActiveMonth }) =>
    !isInActiveMonth &&
    css`
      opacity: 0.25;
    `}
`;
