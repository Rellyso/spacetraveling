import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <>
        <Html>
          <Head>
            <meta name="theme-color" content="#1A1D23" />

            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />

            <link rel="shortcut icon" href="/favicon.png" type="image/png" />
          </Head>

          <Main />
          <NextScript />
        </Html>
      </>
    )
  }
}
