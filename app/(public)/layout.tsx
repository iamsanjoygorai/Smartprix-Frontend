import { Suspense } from "react";

import Header from "@/components/layout/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      {children}
    </>
  );
}
