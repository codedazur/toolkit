/**
 * Use this file to declare non-code modules that need to be importable by the
 * Typescript compiler.
 *
 * @see https://webpack.js.org/guides/typescript/#importing-other-assets
 */

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: { src: string };
  export default content;
}

declare module "*.jpg" {
  const content: { src: string };
  export default content;
}

declare module "*.mp3" {
  const content: string;
  export default content;
}

declare module "*.mp4" {
  const content: string;
  export default content;
}

declare module "*.woff2" {
  const content: string;
  export default content;
}
