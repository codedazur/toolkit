"use client";

import { FunctionComponent, ReactNode, useMemo } from "react";
import {
  Dictionary,
  DictionaryKey,
  Locale,
  dictionaryContext,
} from "../contexts/dictionaryContext";

export interface DictionaryProviderProps {
  locale?: Locale;
  dictionaries: Record<Locale, Record<DictionaryKey, string>>;
  children: ReactNode;
}

export const DictionaryProvider: FunctionComponent<DictionaryProviderProps> = ({
  locale = null,
  dictionaries,
  children,
}) => {
  const map = useMemo(
    () =>
      new Map<Locale, Dictionary>(
        Object.entries(dictionaries).map(([dictionaryLocale, translations]) => [
          dictionaryLocale,
          new Map<DictionaryKey, string>(
            Object.entries(translations) as unknown as [
              DictionaryKey,
              string,
            ][],
          ),
        ]) as [Locale, Dictionary][],
      ),
    [dictionaries],
  );

  return (
    <dictionaryContext.Provider
      value={{
        locale,
        entries: map,
      }}
    >
      {children}
    </dictionaryContext.Provider>
  );
};
