import type { Metadata } from "next";

import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import "./globals.css";

export const metadata: Metadata = {
  title: "Smartprix Clone",
  description:
    "Compare products, prices, specifications and deals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-gray-900">
        <Header />
        <Navbar />

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}