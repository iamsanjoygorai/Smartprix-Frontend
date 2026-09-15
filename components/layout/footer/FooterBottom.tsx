import Link from "next/link";

import {
  footerCopyright,
  footerLegalLinks,
} from "./footer.data";

/* =========================================================
   FOOTER BOTTOM
========================================================= */

export default function FooterBottom() {
  return (
    <div
      className="
        flex
        flex-col
        gap-3
        border-t
        border-gray-200
        pt-5
        text-[12px]
        text-gray-500
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      {/* Copyright */}
      <p>
        Copyright © {footerCopyright.year},{" "}
        {footerCopyright.company}. All Rights Reserved
      </p>

      {/* Legal Links */}
      <nav
        aria-label="Footer legal links"
        className="flex flex-wrap items-center gap-x-2"
      >
        {footerLegalLinks.map((link, index) => (
          <span key={link.href} className="flex items-center">
            <Link
              href={link.href}
              className="
                transition-colors
                duration-200
                hover:text-gray-900
              "
            >
              {link.label}
            </Link>

            {index < footerLegalLinks.length - 1 && (
              <span
                aria-hidden="true"
                className="ml-2 text-gray-300"
              >
                •
              </span>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}