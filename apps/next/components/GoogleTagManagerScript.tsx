import Script from "next/script";
import { FunctionComponent } from "react";

interface GoogleTagManagerScriptProps {
  id: string;
}

export const GoogleTagManagerScript: FunctionComponent<
  GoogleTagManagerScriptProps
> = ({ id }) => (
  <>
    <Script
      id="gtag-base"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: /*js*/ `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer', '${id}');
        `,
      }}
    />
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  </>
);
