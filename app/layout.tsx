import LoadingOverlay from "@/components/common/LoadingOverLay";
import Footer from "@/components/main/Footer";
import Navbar from "@/components/navbar/Navbar";
import { LoadingProvider } from "@/lib/context/loading-context";
import "@/styles/globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "mogumogu's sundries",
  description: "This is a blog that explains programming and computer science!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-4751026650729929" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4751026650729929"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class">
          <LoadingProvider>
            <LoadingOverlay />
            <Navbar />
            <main>
              {children}
              <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID!} />
              <Analytics />
            </main>
            <Footer />
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
