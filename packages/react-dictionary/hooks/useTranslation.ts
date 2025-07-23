import { useContext } from "react";
import {
  dictionaryContext,
  DictionaryKey,
  Locale,
} from "../contexts/dictionaryContext";
import { useDictionary } from "./useDictionary";

export const useTranslation = (key: DictionaryKey, locale?: Locale) => {
  const dictionary = useDictionary(locale);
  const { fallback } = useContext(dictionaryContext);

  return dictionary.get(key) ?? fallback?.(key);
};
