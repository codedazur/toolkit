import { RefObject } from "react";

export type MaybeRef<T extends HTMLElement> = RefObject<T> | T | null;
