import { Vector2 } from "@codedazur/essentials";
import { MaybeRef, useScroll } from "@codedazur/react-essentials";

interface Layer {
  factor: number;
  translation: Vector2;
}

export function useParallax(parameters: {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: number;
}): Layer;

export function useParallax(parameters: {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: number[];
}): Layer[];

export function useParallax({
  scrollRef,
  factor,
}: {
  scrollRef?: MaybeRef<HTMLElement>;
  factor: number | number[];
}): Layer | Layer[] {
  const { position } = useScroll(scrollRef);

  if (Array.isArray(factor)) {
    return factor.map((factor) => layer(factor, position));
  } else {
    return layer(factor, position);
  }
}

function layer(factor: number, position: Vector2): Layer {
  return {
    factor,
    translation: position.multiply(1 - factor),
  };
}
