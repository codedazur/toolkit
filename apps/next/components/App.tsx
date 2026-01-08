import {
  App as BrandApp,
  AppProps as BrandAppProps,
} from "@codedazur/fusion-ui";

export interface AppProps extends BrandAppProps {}

/**
 * This is an extension of the brand-specific `App` component defined in the
 * local `ui` package which allows you to add project-specific functionality to
 * the `App` component. If you don't want to use a shared UI library, feel free
 * to move that component here and to remove the UI package.
 */
export function App(props: AppProps) {
  return <BrandApp {...props} />;
}
