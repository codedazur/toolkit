import { useCallback, useContext } from "react";
import {
  dictionaryContext,
  DictionaryKey,
  Locale,
} from "../contexts/dictionaryContext";
import { useDictionary } from "./useDictionary";

export const useTranslate = (locale?: Locale) => {
  const dictionary = useDictionary(locale);
  const { fallback } = useContext(dictionaryContext);

  return useCallback(
    (key: DictionaryKey): string | undefined => {
      return dictionary.get(key) ?? fallback?.(key);
    },
    [dictionary, fallback],
  );
};
