import { useCallback } from "react";
import { DictionaryKey, Locale } from "../contexts/dictionaryContext";
import { useDictionary } from "./useDictionary";

export const useTranslate = (locale?: Locale) => {
  const dictionary = useDictionary(locale);

  return useCallback(
    (key: DictionaryKey): string => {
      return dictionary.get(key)!;
    },
    [dictionary],
  );
};
