import { useCallback, useEffect, useState } from "react";

/**
 * A hook that determines whether the user prefers reduced motion.
 *
 * This hook returns true if the current device has Reduced Motion setting enabled.
 * The return state will respond to changes in your devices settings and re-render
 * your component with the latest setting.
 */
export const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  const updatePreferences = useCallback(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setReducedMotion(mediaQuery.matches);
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

  return reducedMotion;
};
