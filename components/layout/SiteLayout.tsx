"use client";

import { usePathname } from "next/navigation";

import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Pages that should NOT have the public Header/Navbar/Footer
  const isStandalonePage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/news-admin") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  // Completely standalone pages
  if (isStandalonePage) {
    return <>{children}</>;
  }

  // Normal public website layout
  return (
    <>
      <Header />
      <Navbar />

      <main>{children}</main>

      <Footer />
    </>
  );
}