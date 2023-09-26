import { createContext } from "react";
import { DictionaryKey, Locale } from "@codedazur/react-dictionary";

export type Dictionaries = ReadonlyMap<Locale | null, Dictionary>;
export type Dictionary = ReadonlyMap<DictionaryKey, string>;

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
