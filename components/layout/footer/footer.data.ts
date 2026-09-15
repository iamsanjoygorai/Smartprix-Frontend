/* =========================================================
   FOOTER TYPES
========================================================= */

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSocial {
  label: string;
  href: string;
  icon:
    | "mail"
    | "twitter"
    | "youtube"
    | "instagram"
    | "telegram"
    | "rss"
    | "android"
    | "facebook";
}

/* =========================================================
   FOOTER NAVIGATION
========================================================= */

export const footerCategories: FooterLink[] = [
  {
    label: "Mobile Phones",
    href: "/mobiles",
  },
  {
    label: "Tablets",
    href: "/tablets",
  },
  {
    label: "Cars",
    href: "/cars",
  },
  {
    label: "Earphones",
    href: "/mobile_headphones",
  },
  {
    label: "Smartwatches",
    href: "/smartwatches",
  },
  {
    label: "Laptops",
    href: "/laptops",
  },
  {
    label: "TVs",
    href: "/tvs",
  },
  {
    label: "ACs",
    href: "/air_conditioners",
  },
  {
    label: "Fridge",
    href: "/refrigerators",
  },
  {
    label: "Washing Machines",
    href: "/washing_machines",
  },
  {
    label: "Grocery",
    href: "/grocery",
  },
  {
    label: "Deals",
    href: "/deals",
  },
];

export const footerMobileBrands: FooterLink[] = [
  {
    label: "Samsung Mobiles",
    href: "/mobiles/samsung-brand",
  },
  {
    label: "Redmi / Mi Mobiles",
    href: "/mobiles/xiaomi-brand",
  },
  {
    label: "Realme Mobiles",
    href: "/mobiles/realme-brand",
  },
  {
    label: "Vivo Mobiles",
    href: "/mobiles/vivo-brand",
  },
  {
    label: "Motorola Mobiles",
    href: "/mobiles/motorola-brand",
  },
  {
    label: "OnePlus Mobiles",
    href: "/mobiles/oneplus-brand",
  },
  {
    label: "Oppo Mobiles",
    href: "/mobiles/oppo-brand",
  },
  {
    label: "Apple iPhones",
    href: "/mobiles/apple-brand",
  },
  {
    label: "Infinix Mobiles",
    href: "/mobiles/infinix-brand",
  },
  {
    label: "Poco Mobiles",
    href: "/mobiles/poco-brand",
  },
  {
    label: "Tecno Mobiles",
    href: "/mobiles/tecno-brand",
  },
  {
    label: "Nokia Mobiles",
    href: "/mobiles/nokia-brand",
  },
];

export const footerMobileLists: FooterLink[] = [
  {
    label: "Smartphones",
    href: "/mobiles/smartphone-type",
  },
  {
    label: "5G Mobiles",
    href: "/mobiles/with-5g",
  },
  {
    label: "Curved Phones",
    href: "/mobiles/curved-display-phones-list",
  },
  {
    label: "New Mobiles",
    href: "/mobiles/latest-mobiles",
  },
  {
    label: "Upcoming Mobiles",
    href: "/mobiles/upcoming-stock",
  },
  {
    label: "8GB RAM Mobiles",
    href: "/mobiles/smartphones-with-8gb-ram-list",
  },
  {
    label: "Foldable Phones",
    href: "/mobiles/with-foldable_display",
  },
  {
    label: "Android Mobiles",
    href: "/mobiles/android-os",
  },
  {
    label: "Waterproof Mobiles",
    href: "/mobiles/with-waterproof",
  },
  {
    label: "7000 mAh Mobiles",
    href: "/mobiles/7000-mah-battery-mobiles-list",
  },
  {
    label: "Flip Phones",
    href: "/mobiles/flip-phones-price-list",
  },
  {
    label: "Keypad Mobiles",
    href: "/mobiles/keypad-mobiles-list",
  },
];

export const footerAbout: FooterLink[] = [
  {
    label: "About Smartprix",
    href: "/about/smartprix",
  },
  {
    label: "Team",
    href: "/about/team",
  },
  {
    label: "Editorial Guidelines",
    href: "/about/editorial-guidelines",
  },
  {
    label: "Jobs",
    href: "/about/jobs",
  },
  {
    label: "Contact Us",
    href: "/about/contact",
  },
  {
    label: "Help",
    href: "/about/help",
  },
  {
    label: "Tools",
    href: "/about/tools",
  },
  {
    label: "Find A Mobile",
    href: "/mobiles",
  },
  {
    label: "Compare Mobiles",
    href: "/mobiles/compare.php",
  },
  {
    label: "Latest News",
    href: "/bytes/",
  },
];

/* =========================================================
   SOCIAL LINKS
========================================================= */

export const footerSocials: FooterSocial[] = [
  {
    label: "Email",
    href: "mailto:contact@smartprix.com",
    icon: "mail",
  },
  {
    label: "Twitter / X",
    href: "https://x.com/smartprix",
    icon: "twitter",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCvkQPgMQX_C1i9JnDZmOY2Q",
    icon: "youtube",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/smartprix/",
    icon: "instagram",
  },
  {
    label: "Telegram",
    href: "https://smpx.to/telegram?utm_source=desktop_footer",
    icon: "telegram",
  },
  {
    label: "RSS Feed",
    href: "https://www.smartprix.com/bytes/feed/",
    icon: "rss",
  },
  {
    label: "Android App",
    href: "https://smpx.to/app?utm_source=desktop_footer",
    icon: "android",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/smartprix",
    icon: "facebook",
  },
];

/* =========================================================
   EXTERNAL BRAND LINK
========================================================= */

export const smartprixUSLink: FooterLink = {
  label: "Smartprix US",
  href: "https://us.smartprix.com/?utm_source=footer-noredir",
  external: true,
};

/* =========================================================
   LEGAL LINKS
========================================================= */

export const footerLegalLinks: FooterLink[] = [
  {
    label: "Contact Us",
    href: "/about/contact",
  },
  {
    label: "Privacy Policy",
    href: "/about/privacy-policy",
  },
  {
    label: "Terms of Services",
    href: "/about/terms-of-services",
  },
];

/* =========================================================
   COPYRIGHT
========================================================= */

export const footerCopyright = {
  year: 2026,
  company: "Smartprix.com",
} as const;