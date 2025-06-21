import Footer from "@/components/organism/Footer";
import Navbar from "@/components/organism/navbar/Navbar";
import BlogTourWrapper from "@/components/tour/BlogTourWrapper";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

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
    <ThemeProvider
      attribute="class"
      enableSystem={true}
      defaultTheme="system"
      disableTransitionOnChange
    >
      <Navbar />
      <main>{children}</main>
      <Footer />
      <BlogTourWrapper />
    </ThemeProvider>
  );
}
