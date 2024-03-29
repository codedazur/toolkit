import { useCallback, useEffect, useState } from "react";

export enum Contrast {
  more = "more",
  less = "less",
  custom = "custom",
}

/**
 * A hook that determines whether the user prefers increased contrast.
 *
 * This hook returns true if the current device has increased contrast setting enabled.
 * The return state will respond to changes in your devices settings and re-render your
 * component with the latest setting.
 *
 * In this hook `prefers-contrast` media query is used, see the following link for
 * more information and browser compatibility.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast MDN web docs - prefers-contrast}
 */
export const useContrastPreferences = () => {
  const [contrast, setContrast] = useState<undefined | null | Contrast>(
    undefined,
  );

  const updatePreferences = useCallback(() => {
    const mediaQueries = {
      more: window.matchMedia("(prefers-contrast: more)"),
      less: window.matchMedia("(prefers-contrast: less)"),
      custom: window.matchMedia("(prefers-contrast: custom)"),
    };

    const update = () => {
      if (mediaQueries.more.matches) {
        setContrast(Contrast.more);
      } else if (mediaQueries.less.matches) {
        setContrast(Contrast.less);
      } else if (mediaQueries.custom.matches) {
        setContrast(Contrast.custom);
      } else {
        setContrast(null);
      }
    };

    update();

    mediaQueries.more.addEventListener("change", update);
    mediaQueries.less.addEventListener("change", update);
    mediaQueries.custom.addEventListener("change", update);

    return () => {
      mediaQueries.more.removeEventListener("change", update);
      mediaQueries.less.removeEventListener("change", update);
      mediaQueries.custom.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    updatePreferences();
  }, [updatePreferences]);

  return contrast;
};
