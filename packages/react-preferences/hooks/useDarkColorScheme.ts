import { useCallback, useEffect, useState } from "react";

/**
 * A hook that determines whether the user prefers a dark color scheme.
 *
 * This hook returns true if the current device has dark color scheme setting enabled.
 * The return state will respond to changes in your devices settings and re-render your
 * component with the latest setting.
 */
export const useDarkColorScheme = () => {
  const [darkColorScheme, setDarkColorScheme] = useState(false);

  const updatePreferences = useCallback(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const update = () => {
      setDarkColorScheme(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", update);

    update();

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    updatePreferences();
  }, [updatePreferences]);

  return darkColorScheme;
};
