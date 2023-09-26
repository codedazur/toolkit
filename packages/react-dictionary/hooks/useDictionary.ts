import { useContext } from "react";
import { dictionaryContext } from "../contexts/dictionaryContext";
import { Locale } from "@codedazur/react-dictionary";

export const useDictionary = (locale?: Locale) => {
  const { entries, locale: currentLocale } = useContext(dictionaryContext);

  return entries.get(locale ?? currentLocale)!;
};
