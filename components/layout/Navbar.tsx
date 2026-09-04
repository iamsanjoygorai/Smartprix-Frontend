
import Image from "next/image";
import Link from "next/link";

const navItems = [
  { name: "News", href: "/news" },
  { name: "Reviews", href: "/reviews" },
  { name: "How To", href: "/how-to" },
  { name: "Mobiles", href: "/mobiles" },
  { name: "Tablets", href: "/tablets" },
  { name: "Laptops", href: "/laptops" },
  { name: "TVs", href: "/tvs" },

  {
    name: "Electronics",
    href: "/electronics",

    dropdown: [
      {
        name: "Camera",
        href: "/electronics/camera",
        image: "/categories/camera.png",
      },
      {
        name: "Smart Watches",
        href: "/electronics/smart-watches",
        image: "/categories/smart-watches.png",
      },
      {
        name: "Fitness Bands",
        href: "/electronics/fitness-bands",
        image: "/categories/fitness-bands.png",
      },
    ],

    groups: [
      {
        name: "Gaming",
        items: [
          {
            name: "Gaming Console",
            href: "/electronics/gaming/gaming-console",
            image: "/categories/gaming-console.png",
          },
          {
            name: "Gaming Joysticks",
            href: "/electronics/gaming/gaming-joysticks",
            image: "/categories/gaming-joysticks.png",
          },
        ],
      },
    ],
  },

  { name: "Appliances", href: "/appliances" },
  { name: "Computers", href: "/computers" },
  { name: "Accessories", href: "/accessories" },
  { name: "Auto", href: "/auto" },
  { name: "Flights", href: "/flights" },
];

export default function Navbar() {
  return (
    <nav className="relative z-50 border-b border-blue-900 bg-[#0c468d]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-11 items-center justify-between">

          {navItems.map((item) => (
            <div
              key={item.name}
              className="group relative flex h-full items-center"
            >
              {/* Main Navigation Item */}
              <Link
                href={item.href}
                className="flex h-full items-center gap-1 whitespace-nowrap px-2 text-sm font-bold text-white transition hover:text-gray-200"
              >
                {item.name}

                {item.dropdown && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 group-hover:rotate-180"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </Link>

              {/* Electronics Dropdown */}
              {item.dropdown && (
                <div
                  className="
                    invisible
                    absolute
                    left-0
                    top-full
                    z-[100]
                    w-64
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    py-2
                    opacity-0
                    shadow-xl
                    transition-all
                    duration-200
                    group-hover:visible
                    group-hover:opacity-100
                  "
                >
                  {/* Electronics Categories */}
                  {item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className="
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        text-sm
                        text-gray-700
                        transition
                        hover:bg-gray-100
                        hover:text-gray-200
                      "
                    >
                      {/* Category Image */}
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                        <Image
                          src={subItem.image}
                          alt={subItem.name}
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      </div>

                      {/* Category Name */}
                      <span>{subItem.name}</span>
                    </Link>
                  ))}

                  {/* Divider */}
                  <div className="my-1 border-t border-gray-100" />

                  {/* Gaming */}
                  {item.groups?.map((group) => (
                    <div key={group.name}>

                      {/* Group Heading */}
                      <div className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {group.name}
                      </div>

                      {/* Gaming Categories */}
                      {group.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="
                            flex
                            items-center
                            gap-3
                            px-4
                            py-3
                            text-sm
                            text-gray-700
                            transition
                            hover:bg-gray-100
                            hover:text-gray-200
                          "
                        >
                          {/* Category Image */}
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                            <Image
                              src={subItem.image}
                              alt={subItem.name}
                              fill
                              sizes="40px"
                              className="object-contain p-1"
                            />
                          </div>

                          {/* Category Name */}
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
    </nav>
  );
}
