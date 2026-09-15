import Link from "next/link";

import type { FooterLink } from "./footer.data";

/* =========================================================
   TYPES
========================================================= */

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

/* =========================================================
   FOOTER COLUMN
========================================================= */

export default function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  const headingId = `footer-${title
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="text-[13px] font-bold leading-5 text-gray-900"
      >
        {title}
      </h2>

      <ul className="mt-2 space-y-0">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            {link.external ? (
  <a
    href={link.href}
    target="_blank"
    rel="noopener noreferrer"
    className="
      block
      py-[2px]
      text-[12px]
      leading-[17px]
      text-gray-500
      underline-offset-2
      transition-colors
      duration-150
      hover:text-gray-900
      hover:underline
    "
  >
    {link.label}
  </a>
) : (
  <Link
    href={link.href}
    className="
      block
      py-[2px]
      text-[12px]
      leading-[17px]
      text-gray-500
      underline-offset-2
      transition-colors
      duration-150
      hover:text-gray-900
      hover:underline
    "
  >
    {link.label}
  </Link>
)}
          </li>
        ))}
      </ul>
    </section>
  );
}