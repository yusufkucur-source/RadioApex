import type { Metadata } from "next";
import { Antonio, Anton, Space_Grotesk, Roboto } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

// Font tanımları - display: swap ile hızlı yükleme
const antonio = Antonio({
  subsets: ["latin"],
  variable: "--font-antonio",
  weight: ["400", "700"],
  display: "swap",
  preload: true
});

const anton = Anton({
  subsets: ["latin"],
  variable: "--font-anton",
  weight: "400",
  display: "swap",
  preload: true
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "700"],
  display: "swap",
  preload: true
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  display: "swap",
  preload: true
});

export const metadata: Metadata = {
  metadataBase: new URL("https://radioapex.com.tr"),
  title: "Radio Apex",
  description:
    "Radio Apex — Modern online radio experience with curated DJ sets and live lineup.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" }
    ]
  },
  openGraph: {
    title: "Radio Apex",
    description:
      "Modern online radio experience with curated DJ sets and live lineup.",
    url: "https://radioapex.com.tr",
    siteName: "Radio Apex",
    images: [
      {
        url: "/og-image.png?v=2",
        width: 1024,
        height: 1024,
        alt: "Radio Apex"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Radio Apex",
    description:
      "Modern online radio experience with curated DJ sets and live lineup.",
    images: ["/og-image.png?v=2"]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${antonio.variable} ${anton.variable} ${spaceGrotesk.variable} ${roboto.variable} bg-apex-background text-white`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Radio Apex" />
      </head>
      <body className="min-h-screen bg-apex-background text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
