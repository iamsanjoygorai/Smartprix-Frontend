import FooterBrand from "./footer/FooterBrand";
import FooterBottom from "./footer/FooterBottom";
import FooterColumn from "./footer/FooterColumn";

import {
  footerAbout,
  footerCategories,
  footerMobileBrands,
  footerMobileLists,
} from "./footer/footer.data";

/* =========================================================
   FOOTER
========================================================= */

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div
        className="
          mx-auto
          w-full
          max-w-[1035px]
          px-4
          py-4
          sm:px-5
        "
      >
        {/* =================================================
            DESKTOP / TABLET FOOTER
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            gap-6

            sm:grid-cols-2
            sm:gap-x-8
            sm:gap-y-6

            lg:grid-cols-5
            lg:gap-6
          "
        >
          {/* 1. Brand / Social */}
          <div className="min-w-0">
            <FooterBrand />
          </div>

          {/* 2. Categories */}
          <div className="min-w-0">
            <FooterColumn
              title="Categories"
              links={footerCategories}
            />
          </div>

          {/* 3. Mobile Brands */}
          <div className="min-w-0">
            <FooterColumn
              title="Mobile Brands"
              links={footerMobileBrands}
            />
          </div>

          {/* 4. Mobile Lists */}
          <div className="min-w-0">
            <FooterColumn
              title="Mobile Lists"
              links={footerMobileLists}
            />
          </div>

          {/* 5. About */}
          <div className="min-w-0">
            <FooterColumn
              title="About"
              links={footerAbout}
            />
          </div>
        </div>

        {/* =================================================
            FOOTER BOTTOM
        ================================================= */}

        <div className="mt-5">
          <FooterBottom />
        </div>
      </div>
    </footer>
  );
}