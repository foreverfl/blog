import Footer from "@/components/organism/Footer";
import Navbar from "@/components/organism/navbar/Navbar";
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "mogumogu's lab",
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
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
