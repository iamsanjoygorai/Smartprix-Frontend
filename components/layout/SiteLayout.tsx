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

  // Pages that should NOT have the public header/navbar/footer
  const isAdminPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/news-admin") ||
    pathname.startsWith("/login");

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <Navbar />

      <main>{children}</main>

      <Footer />
    </>
  );
}