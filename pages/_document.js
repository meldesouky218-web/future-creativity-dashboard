import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ---------- Favicon ---------- */}
        <link rel="icon" type="image/png" href="/og-image.png" />

        {/* ---------- Open Graph (Facebook / WhatsApp / LinkedIn) ---------- */}
        <meta property="og:title" content="Future of Creativity Dashboard" />
        <meta property="og:description" content="Smart event and staff management platform." />
        <meta property="og:image" content="https://dashboard.future-creativity.com/og-image.png" />
        <meta property="og:url" content="https://dashboard.future-creativity.com" />
        <meta property="og:type" content="website" />

        {/* ---------- Twitter Cards ---------- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Future of Creativity Dashboard" />
        <meta name="twitter:description" content="Manage your projects and teams seamlessly." />
        <meta name="twitter:image" content="https://dashboard.future-creativity.com/og-image.png" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
