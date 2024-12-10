import Footer from "@/components/main/Footer";
import Navbar from "@/components/navbar/Navbar";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import Head from "next/head";
import StoreProvider from "./StoreProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "mogumogu's sundries",
  description: "This is a blog that explains programming and computer science!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <body className={inter.className}>
        <ThemeProvider attribute="class">
          <StoreProvider>
            <Navbar />
            <main>
              {children}
              <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID!} />
              <Analytics />
            </main>
            <Footer />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
