/**
 * This enum can be overridden using module augmentation.
 *
 * @example
 * // dictionary.d.ts
 *
 * import "@codedazur/react-dictionary";
 *
 * declare module "@codedazur/react-dictionary" {
 *   export enum Locale {
 *     en_US = "en_US",
 *     en_GB = "en_GB",
 *   }
 * }
 */
export enum Locale {
  en_US = "en_US",
}

export const DefaultLocale = Locale.en_US;
