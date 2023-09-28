import { createContext } from "react";

export type Dictionaries = ReadonlyMap<Locale | null, Dictionary>;
export type Dictionary = ReadonlyMap<DictionaryKey, string>;

/**
 * This type can be overridden using module augmentation.
 *
 * @example
 * // dictionary.d.ts
 *
 * import "@codedazur/react-dictionary";
 *
 * declare module "@codedazur/react-dictionary" {
 *   export type DictionaryKey = "foo" | "bar" | "baz";
 * }
 */
export type DictionaryKey = string;

/**
 * This type can be overridden using module augmentation.
 *
 * @example
 * // dictionary.d.ts
 *
 * import "@codedazur/react-dictionary";
 *
 * declare module "@codedazur/react-dictionary" {
 *   export type Locale = "en_US" | "en_GB";
 * }
 */
export type Locale = string;

export interface DictionaryContext {
  locale: Locale | null;
  entries: Dictionaries;
}

export const dictionaryContext = createContext<DictionaryContext>({
  locale: null,
  entries: new Map<Locale | null, Dictionary>([
    [null, new Map<DictionaryKey, string>()],
  ]),
});
