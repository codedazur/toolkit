import { FunctionComponent, ReactNode, useMemo } from "react";
import { Dictionary, dictionaryContext } from "../contexts/dictionaryContext";
import { DictionaryKey, Locale } from "@codedazur/react-dictionary";

export interface DictionaryProviderProps {
  locale?: Locale;
  dictionaries: Record<Locale, Record<DictionaryKey, string>>;
  children: ReactNode;
}

export const DictionaryProvider: FunctionComponent<DictionaryProviderProps> = ({
  locale = Locale.en_US,
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
