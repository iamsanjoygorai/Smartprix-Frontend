import type { Metadata } from "next";

import "./globals.css";
import SiteLayout from "@/components/layout/SiteLayout";

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
        <SiteLayout>{children}</SiteLayout>
      </body>
    </html>
  );
}