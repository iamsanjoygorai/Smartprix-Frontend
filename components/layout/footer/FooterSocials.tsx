"use client";

import {
  Mail,
  Play,
  Rss,
  Send,
  Smartphone,
} from "lucide-react";

import { footerSocials } from "./footer.data";

function SocialIcon({
  type,
}: {
  type: (typeof footerSocials)[number]["icon"];
}) {
  const iconClass = "h-5 w-5";

  switch (type) {
    case "mail":
      return <Mail className={iconClass} />;

    case "twitter":
      return (
        <span className="text-[17px] font-semibold leading-none">
          X
        </span>
      );

    case "youtube":
      return (
        <Play
          className={iconClass}
          fill="currentColor"
        />
      );

    case "instagram":
      return (
        <span
          className="
            relative
            flex
            h-[18px]
            w-[18px]
            items-center
            justify-center
            rounded-[5px]
            border-[1.5px]
            border-current
          "
        >
          <span
            className="
              h-[7px]
              w-[7px]
              rounded-full
              border-[1.5px]
              border-current
            "
          />

          <span
            className="
              absolute
              right-[2px]
              top-[2px]
              h-[3px]
              w-[3px]
              rounded-full
              bg-current
            "
          />
        </span>
      );

    case "telegram":
      return <Send className={iconClass} />;

    case "rss":
      return <Rss className={iconClass} />;

    case "android":
      return <Smartphone className={iconClass} />;

    case "facebook":
      return (
        <span className="text-[20px] font-bold leading-none">
          f
        </span>
      );

    default:
      return null;
  }
}

export default function FooterSocials() {
  return (
    <nav
      aria-label="Smartprix social links"
      className="
        grid
        w-full
        grid-cols-4
        justify-items-start
      "
    >
      {footerSocials.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          title={social.label}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-md
            border
            border-gray-200
            bg-white
            text-gray-600
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:border-gray-300
            hover:bg-gray-50
            hover:text-gray-900
            focus:outline-none
            focus:ring-2
            focus:ring-gray-300
            focus:ring-offset-2
          "
        >
          <SocialIcon type={social.icon} />
        </a>
      ))}
    </nav>
  );
}