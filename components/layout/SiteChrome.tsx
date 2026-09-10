"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface SiteChromeProps {
  children: React.ReactNode;
}

export default function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();

  // Pages that must be completely standalone
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  // Don't render Header, Navbar or Footer
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Normal website pages
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}