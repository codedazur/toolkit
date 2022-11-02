import { AppProps } from "next/app";
import React, { FunctionComponent } from "react";
import { App, darkTheme } from "@codedazur/react-components";

const MyApp: FunctionComponent<AppProps> = ({ Component, pageProps }) => (
  <App rootSelector="#__next" theme={darkTheme}>
    <Component {...pageProps} />
  </App>
);

export default MyApp;
