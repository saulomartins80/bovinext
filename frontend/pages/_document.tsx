import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const developmentCSP = `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ${apiUrl} https://*.supabase.co wss://*.supabase.co; frame-src 'self'; object-src 'none'; base-uri 'self';`;
    const productionCSP = `default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ${apiUrl} https://*.supabase.co wss://*.supabase.co; frame-src 'self'; object-src 'none'; base-uri 'self';`;

    const csp = process.env.NODE_ENV === 'production' ? productionCSP : developmentCSP;

  return (
      <Html lang="pt-BR">
      <Head>
          <meta httpEquiv="Content-Security-Policy" content={csp} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>
        <body>
        <Main />
        <NextScript />
      </body>
    </Html>
    );
  }
}

export default MyDocument;