import type { Metadata } from "next";

import "./globals.css";

import SiteLayout from "@/components/layout/SiteLayout";
import ScrollToTop from "@/components/ScrollToTop";

import CompareProvider from "@/components/comparison/CompareProvider";
import CompareBottomSheet from "@/components/comparison/CompareBottomSheet";
import CompareCatalogLoader from "@/components/comparison/CompareCatalogLoader";

import Providers from "./providers";

import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
    <html
      lang="en"
      className={cn("font-sans", geist.variable)}
    >
      <body className="min-h-screen bg-gray-100 text-gray-900">
        <Providers>
          <TooltipProvider>
            <CompareProvider>
  <CompareCatalogLoader />

  <ScrollToTop />
  <SiteLayout>{children}</SiteLayout>

  <CompareBottomSheet />
</CompareProvider>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
