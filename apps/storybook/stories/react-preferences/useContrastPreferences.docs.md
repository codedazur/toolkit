# useContrastPreferences

A hook that determines whether the user prefers increased contrast.

This hook returns true if the current device has increased contrast setting enabled.
The return state will respond to changes in your devices settings and re-render your
component with the latest setting.

In this hook `prefers-contrast` media query is used, see the following link for
more information and browser compatibility.
[MDN web docs - prefers-contrast](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast)

```js
import { useState } from "react";
import { useContrastPreferences } from "@codedazur/react-preferences";

export function Demo() {
  const preferedContrast = useContrastPreferences();

  return <p>User prefers {preferedContrast || "default"} contrast.</p>;
}
```

## Type Declarations

```js
declare function useContrastPreferences(): boolean;
```
