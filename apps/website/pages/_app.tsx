import { App, darkTheme } from "@codedazur/react-components";
import { MediaProvider } from "@codedazur/react-media";
import { AppProps } from "next/app";
import { FunctionComponent } from "react";

const MyApp: FunctionComponent<AppProps> = ({ Component, pageProps }) => (
  <App rootSelector="#__next" theme={darkTheme}>
    <MediaProvider>
      <Component {...pageProps} />
    </MediaProvider>
  </App>
);

export default MyApp;
