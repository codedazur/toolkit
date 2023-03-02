import { useCallback, useEffect, useState } from "react";

/**
 * A hook that determines whether the user prefers a dark or light color scheme.
 *
 * The return state will respond to changes in your devices settings and re-render your
 * component with the latest settings.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme MDN web docs - prefers-color-scheme}
 */
export const useColorScheme = (): {
  prefersDark: boolean | null;
  prefersLight: boolean | null;
} => {
  const [prefersDark, setPrefersDark] = useState(false);

  const updatePreferences = useCallback(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const update = () => {
      setPrefersDark(mediaQuery.matches);
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

  return { prefersDark, prefersLight: !prefersDark };
};
