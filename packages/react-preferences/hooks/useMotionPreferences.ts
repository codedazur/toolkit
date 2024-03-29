import { useCallback, useEffect, useState } from "react";

export enum Motion {
  reduced = "reduced",
}

/**
 * A hook that determines whether the user prefers reduced motion.
 *
 * This hook returns true if the current device has Reduced Motion setting enabled.
 * The return state will respond to changes in your devices settings and re-render
 * your component with the latest setting.
 *
 * In this hook `prefers-reduced-motion` media query is used, see the following link for
 * more information and browser compatibility.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion MDN web docs - prefers-reduced-motion}
 */
export const useMotionPreferences = () => {
  const [motion, setMotion] = useState<undefined | null | Motion>(undefined);

  const updatePreferences = useCallback(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      const prefersReducedMotion = mediaQuery.matches;
      setMotion(prefersReducedMotion ? Motion.reduced : null);
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

  return motion;
};
