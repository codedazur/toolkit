import { DictionaryKey, Locale } from "@codedazur/react-dictionary";
import { useDictionary } from "./useDictionary";

export const useTranslation = (key: DictionaryKey, locale?: Locale) => {
  const dictionary = useDictionary(locale);

  return dictionary.get(key)!;
};
