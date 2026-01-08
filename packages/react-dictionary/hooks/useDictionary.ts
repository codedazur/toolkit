import { useContext } from "react";
import {
  Dictionary,
  Locale,
  dictionaryContext,
} from "../contexts/dictionaryContext";

export const useDictionary = (locale?: Locale): Dictionary => {
  const { entries, locale: currentLocale } = useContext(dictionaryContext);

  return entries.get(locale ?? currentLocale)!;
};
