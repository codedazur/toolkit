import { useDarkColorScheme } from "./useDarkColorScheme";

/**
 * A hook that determines whether the user prefers a light color scheme.
 *
 * This hook returns true if the current device has light color scheme setting enabled.
 * The return state will respond to changes in your devices settings and re-render your
 * component with the latest setting.
 */
export const useLightColorScheme = () => {
  const darkColorScheme = useDarkColorScheme();

  return !darkColorScheme;
};
