# useColorSchemePreferences

A hook that determines whether the user prefers a dark or light color scheme.

The return state will respond to changes in your devices settings and re-render your
component with the latest settings.

In this hook `prefers-color-scheme` media query is used, see the following link for
more information and browser compatibility.
[MDN web docs - prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

```js
import { useState } from "react";
import { useColorSchemePreferences } from "@codedazur/react-preferences";

export function Demo() {
  const preferedColorScheme = useColorSchemePreferences();

  return <p>User prefers a {preferedColorScheme} color scheme.</p>;
}
```

## Type Declarations

```js
declare function useColorSchemePreferences(): boolean;
```
