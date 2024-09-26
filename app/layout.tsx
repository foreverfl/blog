import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";

import "@/styles/globals.css";
import StoreProvider from "./StoreProvider";
import { ThemeProvider } from "next-themes";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/main/Footer";
import { PostProvider } from "@/context/PostContext";

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
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <body className={inter.className}>
        <ThemeProvider attribute="class">
          <StoreProvider>
            <PostProvider>
              <Navbar />
              <main>
                {children}
                <Analytics />
              </main>
              <Footer />
            </PostProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
