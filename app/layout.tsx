import "./globals.css";

import { Inter } from "next/font/google";
import { themeEffect } from "./theme-effect";
import { Analytics } from "./analytics";
import { Header } from "./header";
import { Footer } from "./footer";
import { doge } from "./doge";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kris Yotam's blog",
  description:
    "Kris Yotam is a undergrad mathematics student at IU Bloomington.",
  icons: { icon: '/images/logo.png' },
  openGraph: {
    title: "Kris Yotamg's blog",
    description:
      "Kris Yotam is a undergrad mathematics student at IU Bloomington.",
    url: "https://krisyotam.net",
    siteName: "Kris Yotamg's blog",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@krisyotam",
    creator: "@krisyotam",
  },
  metadataBase: new URL("https://krisyotam.net"),
};

export const viewport = {
  themeColor: "transparent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.className} antialiased`}
      suppressHydrationWarning={true}
    >
      <head>
        <link rel="icon" href="/images/logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(${themeEffect.toString()})();(${doge.toString()})();`,
          }}
        />
        {/* Seline Analytics */}
        <Script
          src="https://cdn.seline.com/seline.js"
          data-token="dfbc504c3df49b9"
          strategy="afterInteractive"
        />
      </head>

      <body className="dark:text-gray-100 max-w-2xl m-auto">
        <main className="p-6 pt-3 md:pt-6 min-h-screen">
          <Header />
          {children}
        </main>

        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
