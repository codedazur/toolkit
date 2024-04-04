import { RefObject, useEffect, useState } from "react";

/**
 * Determine if the element is hovered by the user.
 *
 * @param elementRef
 * @returns boolean
 */
export function useHover<T extends HTMLElement = HTMLElement>(
  elementRef: RefObject<T>,
): boolean {
  const [isHovered, setIsHovered] = useState(false);

  const mouseEnterHandler = () => setIsHovered(true);
  const mouseLeaveHandler = () => setIsHovered(false);

  useEffect(() => {
    const element = elementRef.current;

    if (element) {
      element.addEventListener("mouseenter", mouseEnterHandler);
      element.addEventListener("mouseleave", mouseLeaveHandler);

      return () => {
        element.removeEventListener("mouseenter", mouseEnterHandler);
        element.removeEventListener("mouseleave", mouseLeaveHandler);
      };
    }
  }, [elementRef]);

  return isHovered;
}
