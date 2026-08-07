# Store Logo Audit — couponawy (كوبوناوي)

**Date:** 2026-05-28
**Scope:** Top ~50 stores (10 `is_featured = true`, topped up to 50 by `display_order` ascending).
**Method:** Read-only. Each `stores.logo_url` fetched via `curl` with the Brandfetch client id (`?c=…`) appended to `cdn.brandfetch.io` URLs. Flagged on: NULL logo; HTTP 4xx/5xx; non-image Content-Type; payload < ~1 KB (Brandfetch 1×1 placeholder); or Brandfetch logo domain ≠ store website domain. Data-quality flags: Latin-text `name_ar`, generic/placeholder domains.

---

## Summary

| Metric         | Count |
| -------------- | ----- |
| Stores checked | 50    |
| Clean          | 27    |
| Flagged        | 23    |

### Counts by issue type

| Issue                                  | Count | Notes                                                                                            |
| -------------------------------------- | ----- | ------------------------------------------------------------------------------------------------ |
| `TINY_PAYLOAD` (426 B 1×1 placeholder) | 17    | **Real problem** — Brandfetch has no logo for the domain. App falls back to Arabic initials.     |
| `DOMAIN_MISMATCH`                      | 4     | Mostly benign same-brand domain variants; all returned real images. Verify visually.             |
| `GENERIC_DOMAIN`                       | 3     | **False positives** — substring match on `…store.com`. All are legitimate brand domains. Ignore. |
| `NAME_AR_LATIN`                        | 1     | `2b` — the brand is genuinely Latin-named ("2B"). Borderline, not a true defect.                 |

### Key findings

- **Brandfetch placeholders are the dominant issue (17 stores).** Every Brandfetch URL returns HTTP 200 with `image/webp`, but for 17 stores the payload is exactly **426 bytes** — Brandfetch's transparent 1×1 placeholder, meaning it has **no logo on file** for that domain. The domains themselves are correct (Brandfetch domain == website domain in all 17). The smallest _real_ logo in the set is 1388 B (shein), so 426 B is an unambiguous placeholder threshold.
- **Latin-text `name_ar` is NOT widespread.** Only **1 of 50** stores (`2b`) has a non-Arabic `name_ar`, and that brand is legitimately spelled "2B" in Latin. No stores have a slug-like or transliterated `name_ar` (e.g. no "alfakhera"-style values were found).
- **The 3 `GENERIC_DOMAIN` flags are false positives.** `sulindastore.com`, `asgharalistore.com`, `loktstore.com` only matched because the audit regex caught `store.com` as a substring. These are real brand domains — no action needed.
- **The 4 `DOMAIN_MISMATCH` flags are same-brand domain variants** and all returned real (non-placeholder) images, so the logos are very likely correct. They need only a quick visual confirmation, not a fix.

---

## Prioritized fix list (worst-first)

| Store slug       | name_ar          | Website domain     | Logo issue                                                        | Suggested fix                                                                                                                           |
| ---------------- | ---------------- | ------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `asgharalistore` | اصغر علي للعطور  | asgharalistore.com | Brandfetch 1×1 placeholder (426 B); no real logo                  | Source a real logo (manual upload / store site favicon-large); else rely on initials fallback. Ignore the spurious GENERIC_DOMAIN flag. |
| `bnat-ali`       | كليجا بنات علي   | bnat-ali.com       | Brandfetch placeholder (426 B)                                    | Upload real logo or accept Arabic-initials fallback.                                                                                    |
| `calaisperfume`  | عطور كاليه       | calaisperfume.com  | Brandfetch placeholder (426 B)                                    | Upload real logo or accept fallback.                                                                                                    |
| `debajsa`        | عبايات ديباج     | debajsa.com        | Brandfetch placeholder (426 B)                                    | Upload real logo or accept fallback.                                                                                                    |
| `flottlife`      | مفارش فلوت       | flottlife.com      | Brandfetch placeholder (426 B)                                    | Upload real logo or accept fallback.                                                                                                    |
| `gildapearlme`   | غيلدا آند بيرل   | gildapearl.me      | Brandfetch placeholder (426 B)                                    | Upload real logo or accept fallback.                                                                                                    |
| `hana`           | عسل هناء الالمعي | hana.com           | Brandfetch placeholder (426 B)                                    | Verify `hana.com` is the correct domain (generic name — may be wrong site); then upload real logo or accept fallback.                   |
| `hoorabaya`      | عبايات حور       | hoorabaya.com      | Brandfetch placeholder (426 B)                                    | Upload real logo or accept fallback.                                                                                                    |
| `hsate`          | فخامة رجل        | hsate.com          | Brandfetch placeholder (426 B)                                    | Upload real logo or accept fallback.                                                                                                    |
| `lafayettehoney` | عسل لافييت       | lafayettehoney.com | Brandfetch placeholder (426 B)                                    | Upload real logo or accept fallback.                                                                                                    |
| `lebs`           | لبسكم            | lebs.com           | Brandfetch placeholder (426 B)                                    | Verify `lebs.com` is correct (generic) ; then upload real logo or accept fallback.                                                      |
| `loktstore`      | لوكت ستور        | loktstore.com      | Brandfetch placeholder (426 B); no real logo                      | Upload real logo or accept fallback. Ignore the spurious GENERIC_DOMAIN flag.                                                           |
| `madmoon`        | مضمون            | madmoon.sa         | Brandfetch placeholder (426 B)                                    | Upload real logo or accept fallback.                                                                                                    |
| `manukadose`     | عسل مانوكا دوز   | manukadose.com     | Brandfetch placeholder (426 B)                                    | Upload real logo or accept fallback.                                                                                                    |
| `qimmati`        | قمتي             | qimmati.com        | Brandfetch placeholder (426 B)                                    | Upload real logo or accept fallback.                                                                                                    |
| `shaykha90`      | عبايات شيخة      | shaykha90.com      | Brandfetch placeholder (426 B)                                    | Upload real logo or accept fallback.                                                                                                    |
| `shgardiapp`     | شقردي            | shgardi.app        | Brandfetch placeholder (426 B)                                    | Upload real logo or accept fallback.                                                                                                    |
| `amazon-sa`      | أمازون السعودية  | amazon.sa          | Logo from `amazon.com` (not `amazon.sa`); real image 1526 B       | Likely fine (same brand). Verify visually; optionally repoint to `amazon.sa` for regional accuracy.                                     |
| `jahez`          | جاهز             | jahez.net          | Logo from `jahez.com` (not `jahez.net`); real image 1830 B        | Likely fine (same brand). Verify visually.                                                                                              |
| `nahdi`          | صيدلية النهدي    | nahdionline.com    | Logo from `nahdi.sa` (not `nahdionline.com`); real image 4010 B   | Likely fine — `nahdi.sa` is arguably the stronger brand domain. Verify visually; consider aligning `website_url` and logo domain.       |
| `ninja`          | نينجا            | ninja.sa           | Logo from `ninjadelivery.com` (not `ninja.sa`); real image 2622 B | Verify the logo matches the Ninja grocery brand; repoint to `ninja.sa` if it's the wrong Ninja.                                         |
| `2b`             | 2b               | 2b.com             | `name_ar` is Latin ("2b")                                         | Set a proper Arabic display name if the brand uses one; otherwise acceptable (brand is Latin-named "2B").                               |
| `sulindastore`   | سوليندا          | sulindastore.com   | (False positive: GENERIC_DOMAIN)                                  | No action — logo is real (6452 B) and domain is legitimate.                                                                             |

---

## Notes / caveats

- **Fallback safety net:** The `StoreLogo` client component already swaps the Brandfetch placeholder for Arabic initials when `naturalWidth < 32`, so the 17 placeholder stores degrade gracefully on the live site — they are not broken images, just missing real brand marks. Prioritize the **featured** stores among them for manual logo sourcing.
- **No NULL logos and no HTTP errors** were found in the top 50 — the earlier backfill migration populated every featured row.
- The `c=` (Brandfetch client id) param was confirmed necessary: it was appended to all `cdn.brandfetch.io` fetches during this audit.
