# @codedazur/react-dictionary

A lightweight, type-safe, and easy-to-use internationalization (i18n) library for React.

## Installation

```bash
npm install @codedazur/react-dictionary
```

## Usage

### `useTranslate`

The primary way to use this library is with the `useTranslate` hook. It returns a stable, memoized translation function that you can use for all translations within a component.

```tsx
import { useTranslate } from "@codedazur/react-dictionary";

export function MyComponent() {
  const translate = useTranslate();

  return (
    <>
      <h1>{translate("hello.world")}</h1>
      <p>{translate("goodbye.world")}</p>
    </>
  );
}
```

By default, the `useTranslate` hook will use the locale from the `DictionaryProvider`. You can also specify a different locale on-the-fly:

```tsx
const translate = useTranslate("nl");
```

### `useDictionary`

For direct access to the dictionary, for example to iterate or get all keys, you can use the `useDictionary` hook.

```tsx
import { useDictionary } from "@codedazur/react-dictionary";

export function MyComponent() {
  const dictionary = useDictionary();
  return <div>{dictionary.get("hello.world")}</div>;
}
```

Keep in mind that the dictionary is a `ReadonlyMap`. It can only be updated by changing the `dictionaries` prop of the `DictionaryProvider`.

## Providing Dictionaries

In order to use the `useTranslate` and `useDictionary` hooks, you need to provide dictionaries to the `DictionaryProvider`. Your application can provide dictionaries in two ways: by providing them locally or by fetching them from a remote source.

### Local Dictionaries

To get started, you need to wrap your application with the `DictionaryProvider`. This provider will hold your dictionaries and the current locale.

#### 1. Define Your Dictionaries

Create your dictionary files. The structure is an object where keys are locales and values are another object containing your key-value translations.

```ts
// data/dictionaries/en.ts
import { Dictionary } from "@codedazur/react-dictionary";

export const en: Dictionary = {
  "hello.world": "Hello, world!",
  "goodbye.world": "Goodbye, world!",
};
```

```ts
// data/dictionaries/nl.ts
import { Dictionary } from "@codedazur/react-dictionary";

export const nl: Dictionary = {
  "hello.world": "Hallo, wereld!",
  "goodbye.world": "Tot ziens, wereld!",
};
```

#### 2. Configure the DictionaryProvider

In your application's entry point, import your dictionaries and the `DictionaryProvider` and pass the dictionaries to the `DictionaryProvider`.

```tsx
// app.tsx
import { DictionaryProvider } from "@codedazur/react-dictionary";
import { en } from "../data/dictionaries/en";
import { nl } from "../data/dictionaries/nl";

export default function App({ children }) {
  return (
    <DictionaryProvider dictionaries={{ en, nl }} locale="en">
      {children}
    </DictionaryProvider>
  );
}
```

### Remote Dictionaries (Server Component)

In many applications, your translation files will be fetched from an API endpoint. When using a framework that supports React Server Components (like Next.js), you can fetch your dictionaries on the server to improve performance and avoid a client-side loading state. This moves the data-fetching from the browser to the server, which is often much faster.

The pattern is to have a **Server Component** fetch the data and pass it as a prop to a **Client Component** that contains the `DictionaryProvider`.

#### 1. Fetch Data in a Server Component

In your `layout.tsx` or `page.tsx`, you can fetch the dictionaries.

```tsx
// app/layout.tsx
import { DictionaryProvider } from "../components/DictionaryProvider";
import { Dictionaries } from "@codedazur/react-dictionary";

async function getDictionaries(): Dictionaries {
  const response = await fetch("https://...");
  return response.json() as Dictionaries;
}

export default async function RootLayout({ children }) {
  const dictionaries = await getDictionaries();

  return (
    <html>
      <body>
        <DictionaryProvider dictionaries={dictionaries} locale="en">
          {children}
        </DictionaryProvider>
      </body>
    </html>
  );
}
```

#### 2. Create a Client Component for the Provider

Because `DictionaryProvider` uses Context, it must be in a Client Component. Create a new file to re-export it and add the `"use client"` directive at the top.

```tsx
// components/DictionaryProvider.tsx
"use client";
export { DictionaryProvider } from "@codedazur/react-dictionary";
```

With this setup, the translations are fetched on the server and are immediately available on the client, eliminating the need for a loading state and reducing the time to a meaningful paint.

### Remote Dictionaries (Client Component)

If you cannot or do not want to use React Server Components, you can still still work with remote dictionaries by creating a wrapper component that fetches the data, stores it in state and passes it to the `DictionaryProvider` once the data is available.

```tsx
// RemoteDictionaryProvider.tsx
import { useState, useEffect, ReactNode } from "react";
import {
  Dictionaries,
  DictionaryProvider,
  Locale,
} from "@codedazur/react-dictionary";

interface RemoteDictionaryProviderProps {
  children: ReactNode;
}

async function getDictionaries(): Dictionaries {
  const response = await fetch("https://...");
  return response.json() as Dictionaries;
}

export function RemoteDictionaryProvider({
  children,
}: RemoteDictionaryProviderProps) {
  const [dictionaries, setDictionaries] = useState<Dictionaries | null>(null);

  useEffect(() => {
    fetchDictionaries.then(setDictionaries);
  }, []);

  return (
    <DictionaryProvider dictionaries={dictionaries} locale="en">
      {children}
    </DictionaryProvider>
  );
}
```

## Managing Locales

The `locale` prop on the `DictionaryProvider` controls which dictionary is currently active. Because this is a standard prop, you have full control over how the locale is managed. The two most common patterns are driving the locale from the URL or from client-side state.

### URL-Driven Locales (Recommended for Next.js)

In multi-language applications using frameworks like Next.js, the most robust pattern is to include the locale in the URL (e.g., `/en/about`, `/nl/about`). The `locale` can then be read from the URL parameters in a Server Component and passed down to the `DictionaryProvider`.

Because the `DictionaryProvider` uses context, it must be used within a Client Component. The pattern is to have a Server Component (your layout) pass the `locale` to a Client Component that wraps the `DictionaryProvider`.

```tsx
// app/[locale]/layout.tsx (Server Component)
// ...

export default async function RootLayout({ children, params }) {
  const dictionaries = await getDictionaries();
  const { locale } = params;

  return (
    <html lang={locale}>
      <body>
        <DictionaryProvider dictionaries={dictionaries} locale={locale}>
          {children}
        </DictionaryProvider>
      </body>
    </html>
  );
}
```

With this setup, changing the language is a matter of navigating to a different URL, and the entire application will react accordingly.

### State-Driven Locales (Client-Side / SPAs)

For Single-Page Applications or when you prefer to manage language without changing the URL, you can control the `locale` prop using React state. This state can be persisted to `localStorage` to remember the user's choice across visits.

Here is a complete example of a `LocaleProvider` that encapsulates this logic and provides a `useLocale` hook to any component that needs to change the language.

```tsx
// components/LocaleProvider.tsx
"use client";

import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import {
  DictionaryProvider,
  Dictionaries,
  Locale,
} from "@codedazur/react-dictionary";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
  dictionaries: Dictionaries;
  defaultLocale: Locale;
}

export function LocaleProvider({
  children,
  dictionaries,
  defaultLocale,
}: LocaleProviderProps) {
  /**
   * On the server, initialize to the default locale. In the browser, initialize
   * to the value from localStorage or fall back to the default.
   */
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return defaultLocale;
    }
    return (localStorage.getItem("locale") as Locale) || defaultLocale;
  });

  // Update localStorage whenever the locale changes.
  useEffect(() => {
    localStorage.setItem("locale", locale);
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleContext.Provider value={value}>
      <DictionaryProvider dictionaries={dictionaries} locale={locale}>
        {children}
      </DictionaryProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
```

## Type Augmentation

For a better developer experience and type safety, you can augment the `Locale` and `DictionaryKey` types. Create a `d.ts` file in your project (e.g., `dictionary.d.ts`) and declare your custom types.

```ts
// dictionary.d.ts
import "@codedazur/react-dictionary";

declare module "@codedazur/react-dictionary" {
  export type Locale = "en" | "nl";
  export type DictionaryKey = "hello.world" | "goodbye.world";
}
```

This will provide autocompletion and type-checking for your locales and translation keys.

## API

### Hooks

| Hook                               | Returns               | When to use                                                       |
| :--------------------------------- | :-------------------- | :---------------------------------------------------------------- |
| **`useTranslate(locale?)`**        | `(key) => "..."`      | The primary hook for translating multiple keys in a component.    |
| **`useTranslation(key, locale?)`** | `"..."`               | For translating a single key. Less performant if used many times. |
| **`useDictionary(locale?)`**       | `Map<string, string>` | For direct access to the dictionary to iterate or get all keys.   |

### `DictionaryProviderProps`

| Prop           | Type                                            | Default | Description                                                  |
| :------------- | :---------------------------------------------- | :------ | :----------------------------------------------------------- |
| `locale`       | `Locale`                                        | `null`  | The default locale to be used by the hooks.                  |
| `dictionaries` | `Record<Locale, Record<DictionaryKey, string>>` |         | An object containing all your dictionaries, keyed by locale. |
| `children`     | `ReactNode`                                     |         | Your application components.                                 |
