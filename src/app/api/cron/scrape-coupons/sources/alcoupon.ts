// saudi.alcoupon.com adapter — large Saudi aggregator.
//
// Tile structure (verified 2026-05):
//   <div id="nid_…" class="item edit_dot_wrapper link-js-expand-wrapper">
//     <div class="offer-type-coupon">
//       <div class="child-label">كاش باك 10%</div>   ← discount_display
//       <h2 class="offer-title">…</h2>                ← title_ar
//       <textarea class="coupon-text">ALC45</textarea> ← code
//     </div>
//   </div>
//
// "offer-expired" appears on the wrapper class for retired tiles — we skip those.

import * as cheerio from "cheerio";
import type { CouponSource, ScrapedCoupon } from "./types";

export const alcoupon: CouponSource = {
  name: "alcoupon",
  storeUrl: (slug) => `https://saudi.alcoupon.com/ar/discount-codes/${encodeURIComponent(slug)}`,
  parse(html) {
    const $ = cheerio.load(html);
    const out: ScrapedCoupon[] = [];

    // Only non-expired tiles. The expired class is a substring match on the
    // wrapper, so we filter explicitly rather than relying on selector :not.
    $("div.item.link-js-expand-wrapper").each((_, el) => {
      const $el = $(el);
      const wrapperClass = $el.attr("class") ?? "";
      if (wrapperClass.includes("offer-expired")) return;

      // The .offer-type-coupon container holds the code + title + discount
      const $coupon = $el.find(".offer-type-coupon").first();
      if ($coupon.length === 0) return;

      const code = $coupon.find("textarea.coupon-text").first().text().trim();
      if (!code) return;

      const discount = $coupon.find(".child-label").first().text().trim();
      const title = $coupon.find("h2.offer-title").first().text().trim();

      out.push({
        code,
        title_ar: title || undefined,
        discount_display: discount || undefined,
      });
    });

    return out;
  },
};
