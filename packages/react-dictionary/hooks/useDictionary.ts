import { useContext } from "react";
import { Locale, dictionaryContext } from "../contexts/dictionaryContext";

export const useDictionary = (locale?: Locale) => {
  const { entries, locale: currentLocale } = useContext(dictionaryContext);

  return entries.get(locale ?? currentLocale)!;
};
