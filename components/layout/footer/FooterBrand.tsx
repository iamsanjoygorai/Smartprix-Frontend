import Link from "next/link";

import FooterSocials from "./FooterSocials";
import { smartprixUSLink } from "./footer.data";

/* =========================================================
   FOOTER BRAND
========================================================= */

export default function FooterBrand() {
  return (
    <div className="flex flex-col items-start">
      {/* Smartprix US */}
      <a
        href={smartprixUSLink.href}
        target="_blank"
        rel="noopener noreferrer"
        className="
          text-sm font-medium text-gray-700
          transition-colors duration-200
          hover:text-gray-950
        "
      >
        {smartprixUSLink.label}
      </a>

      {/* Social Links */}
      <div className="mt-5">
        <FooterSocials />
      </div>

      {/* Smartprix Logo / Wordmark */}
      <Link
        href="/"
        aria-label="Smartprix Home"
        className="
          mt-6
          inline-flex
          items-center
          text-2xl
          font-extrabold
          tracking-tight
          text-gray-900
          transition-opacity
          hover:opacity-80
        "
      >
        Smartprix
      </Link>
    </div>
  );
}