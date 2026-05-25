// couponava.com adapter — Arabic coupon aggregator, server-rendered.
//
// Tile structure (verified 2026-05):
//   <article class="tc-box banko js-open-offer" data-store="…" data-logo="…">
//     <span class="promo">%10 <small>خصم</small></span>          ← discount_display
//     <h2 class="tct">…</h2>                                     ← title_ar
//     <span class="cbcod">VN32</span>                             ← code
//   </article>
//
// Class "ex" on the article = exclusive offer (we don't track that yet).

import * as cheerio from "cheerio";
import type { CouponSource, ScrapedCoupon } from "./types";

export const couponava: CouponSource = {
  name: "couponava",
  storeUrl: (slug) => `https://couponava.com/store/${encodeURIComponent(slug)}/`,
  parse(html) {
    const $ = cheerio.load(html);
    const out: ScrapedCoupon[] = [];

    $("article.tc-box.banko").each((_, el) => {
      const $el = $(el);
      const code = $el.find(".cbcod").first().text().trim();
      if (!code) return;

      // Discount: combine the percentage/number + the suffix word
      // ("%10" + " خصم") → "%10 خصم". The site renders the percent sign
      // before the digit (Arabic convention), which is fine for display.
      const discount = $el
        .find(".promo")
        .first()
        .text()
        .replace(/\s+/g, " ")
        .trim();

      const title = $el.find("h2.tct").first().text().trim();

      out.push({
        code,
        title_ar: title || undefined,
        discount_display: discount || undefined,
      });
    });

    return out;
  },
};
