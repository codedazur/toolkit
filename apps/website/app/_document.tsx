import Document, { DocumentContext } from "next/document";
import { ServerStyleSheet } from "styled-components";

/**
 * This is the officially recommended approach for implementing server-side
 * Styled Components in Next.js.
 * @see https://github.com/vercel/next.js/blob/canary/examples/with-styled-components/pages/_document.tsx
 */
export default class MyDocument extends Document {
  static override async getInitialProps(context: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = context.renderPage;

    try {
      context.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(context);

      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      };
    } finally {
      sheet.seal();
    }
  }
}
