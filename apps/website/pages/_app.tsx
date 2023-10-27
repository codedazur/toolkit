import { AppProps } from "next/app";
import React, { FunctionComponent } from "react";
import { App, darkTheme } from "@codedazur/react-components";
import { MediaProvider } from "@codedazur/react-media";

const MyApp: FunctionComponent<AppProps> = ({ Component, pageProps }) => (
  <App rootSelector="#__next" theme={darkTheme}>
    <MediaProvider>
      <Component {...pageProps} />
    </MediaProvider>
  </App>
);

export default MyApp;
