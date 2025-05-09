import { RefObject } from "react";

export type MaybeRef<T extends Element> = RefObject<T | null> | T | null;
