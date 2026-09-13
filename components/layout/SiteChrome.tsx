"use client";

import { Suspense } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-16" />
        }
      >
        <Header />
      </Suspense>

      {children}

      <Footer />
    </>
  );
}
