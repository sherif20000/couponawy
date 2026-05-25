// sa.arabiccoupon.com adapter — Saudi-focused Arabic aggregator.
//
// Tile structure (verified 2026-05):
//   <div class="item card offer-type-code" data-nref="…">
//     <div class="offer-anchor">                ← discount block
//       <span class="line line-larger">خصم</span>
//       <span class="line line-large">10%</span>
//     </div>
//     <div class="offer-item-title">
//       <a>…title…</a>
//     </div>
//     <span class="coupon-code">BG525</span>     ← code (text)
//     <button class="js-copy" data-offer-code="BG525" data-store-name="noon">
//   </div>
//
// We prefer data-offer-code on the button — more robust than parsing the
// visible code span (which sometimes hides chars behind "click to reveal").

import * as cheerio from "cheerio";
import type { CouponSource, ScrapedCoupon } from "./types";

export const arabiccoupon: CouponSource = {
  name: "arabiccoupon",
  storeUrl: (slug) => `https://sa.arabiccoupon.com/ar/offers/${encodeURIComponent(slug)}`,
  parse(html) {
    const $ = cheerio.load(html);
    const out: ScrapedCoupon[] = [];

    $("div.item.card.offer-type-code").each((_, el) => {
      const $el = $(el);

      // Prefer the data attribute on the copy button — most robust.
      let code = $el.find("button.js-copy").first().attr("data-offer-code") ?? "";
      if (!code) {
        code = $el.find(".coupon-code").first().text().trim();
      }
      if (!code) return;

      // Discount: join "خصم" + "10%" with a space → "خصم 10%"
      const discountParts: string[] = [];
      $el.find(".offer-anchor .line").each((__, span) => {
        const t = $(span).text().trim();
        if (t) discountParts.push(t);
      });
      const discount = discountParts.join(" ");

      const title = $el.find(".offer-item-title a").first().text().trim();

      out.push({
        code,
        title_ar: title || undefined,
        discount_display: discount || undefined,
      });
    });

    return out;
  },
};
