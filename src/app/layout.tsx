import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";

// Font files can be colocated inside of `app`
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
      <body className={inter.className}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
