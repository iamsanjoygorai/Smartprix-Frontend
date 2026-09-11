import type { Metadata } from "next";

import "./globals.css";

import SiteLayout from "@/components/layout/SiteLayout";
import ScrollToTop from "@/components/ScrollToTop";
import Providers from "./providers";

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
        <Providers>
          <ScrollToTop />
          <SiteLayout>{children}</SiteLayout>
        </Providers>
      </body>
    </html>
  );
}