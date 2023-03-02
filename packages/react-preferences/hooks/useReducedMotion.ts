import { useCallback, useEffect, useState } from "react";

/**
 * A hook that determines whether the user prefers reduced motion.
 *
 * This hook returns true if the current device has Reduced Motion setting enabled.
 * The return state will respond to changes in your devices settings and re-render
 * your component with the latest setting.
 * 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion MDN web docs - prefers-reduced-motion}
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<
    null | boolean
  >(null);

  const updatePreferences = useCallback(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setPrefersReducedMotion(mediaQuery.matches);
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

  return prefersReducedMotion;
};
