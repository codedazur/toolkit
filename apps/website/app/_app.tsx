import { App as CdaApp } from "@codedazur/react-components";
import { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CdaApp>
      <Component {...pageProps} />
    </CdaApp>
  );
}
