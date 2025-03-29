import { useEffect, useState } from "react";
import { MaybeRef } from "../types/MaybeRef";
import { resolveMaybeRef } from "../utilities/resolveMaybeRef";

/**
 * This hook returns a boolean that indicates whether the cursor is hovering
 * over a particular element.
 */
export function useHover<T extends HTMLElement = HTMLElement>(
  ref: MaybeRef<T>,
): boolean {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  useEffect(() => {
    const element = resolveMaybeRef(ref);

    if (element) {
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [ref]);

  return isHovered;
}
