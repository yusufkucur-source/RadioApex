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
  title: "Radio Apex",
  description:
    "Radio Apex — Modern online radio experience with curated DJ sets and live lineup.",
  icons: {
    icon: "/favicon.ico"
  },
  openGraph: {
    title: "Radio Apex",
    description:
      "Modern online radio experience with curated DJ sets and live lineup.",
    url: "https://radioapex.example.com",
    siteName: "Radio Apex",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Radio Apex",
    description:
      "Modern online radio experience with curated DJ sets and live lineup."
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className="min-h-screen bg-apex-background text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
