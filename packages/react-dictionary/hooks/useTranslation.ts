import { DictionaryKey, Locale } from "../contexts/dictionaryContext";
import { useDictionary } from "./useDictionary";

export const useTranslation = (key: DictionaryKey, locale?: Locale) => {
  const dictionary = useDictionary(locale);

  return dictionary.get(key)!;
};
