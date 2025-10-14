import type { Metadata } from "next";
import { Manrope, Antonio, Anton, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const antonio = Antonio({
  subsets: ["latin"],
  variable: "--font-antonio"
});

const anton = Anton({
  subsets: ["latin"],
  variable: "--font-anton",
  weight: "400"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
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
    locale: "tr_TR",
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
      lang="tr"
      className={`${manrope.variable} ${antonio.variable} ${anton.variable} ${spaceGrotesk.variable} bg-apex-background text-white`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-apex-background text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
