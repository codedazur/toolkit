/**
 * This type can be overridden using module augmentation.
 *
 * @example
 * // dictionary.d.ts
 *
 * import "@codedazur/react-dictionary";
 *
 * declare module "@codedazur/react-dictionary" {
 *   export enum DictionaryKey {
 *     "foo",
 *     "bar",
 *     "baz",
 *   }
 * }
 */
export enum DictionaryKey {}
