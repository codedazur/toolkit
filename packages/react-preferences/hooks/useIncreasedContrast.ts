import { useCallback, useEffect, useState } from "react";

/**
 * A hook that determines whether the user prefers increased contrast.
 *
 * This hook returns true if the current device has increased contrast setting enabled.
 * The return state will respond to changes in your devices settings and re-render your
 * component with the latest setting.
 */
export const useIncreasedContrast = () => {
  const [increasedContrast, setIncreasedContrast] = useState(false);

  const updatePreferences = useCallback(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast)");

    const update = () => {
      setIncreasedContrast(mediaQuery.matches);
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

  return increasedContrast;
};
