/**
 * One-shot logo PNG generator.
 *
 * Renders the Coupon Ticket mark (Concept B) as a 512×512 PNG and writes
 * it to `public/logo.png`. This is the file referenced by `publisher.logo`
 * in five JSON-LD Article schemas across the site — Google requires PNG
 * (not SVG) for that field per their structured-data guidelines.
 *
 * The mark itself is identical in concept to app/icon.tsx and
 * app/apple-icon.tsx, but rendered statically here so the JSON-LD URL
 * stays a plain `/logo.png` instead of a Next-hashed URL.
 *
 * Run once when the design changes:  node scripts/generate-logo-png.mjs
 * (Not wired into the build pipeline — by design, treats the PNG as a
 * committed asset, not a build artifact.)
 */

import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SIZE = 512;
const RED = "#c41e1a";
const GOLD = "#dca700";
const CREAM = "#fafaf9";

// SVG construction. Sharp's libvips renders this faithfully — system fonts
// are picked up via Fontconfig, so the "%" glyph uses Helvetica/Arial on
// macOS and DejaVu Sans on Linux CI. We use a path for the perforation
// dashes rather than CSS so libvips doesn't need to compute repeating-
// linear-gradient (which it doesn't fully support).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  <defs>
    <!-- Mask: white fill keeps the body, black circles cut out the side notches -->
    <mask id="ticket-cut">
      <rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="white"/>
      <circle cx="0"      cy="${SIZE / 2}" r="56" fill="black"/>
      <circle cx="${SIZE}" cy="${SIZE / 2}" r="56" fill="black"/>
    </mask>
  </defs>

  <!-- Ticket body — rounded square with side notches cut out -->
  <rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="92" ry="92"
        fill="${RED}" mask="url(#ticket-cut)"/>

  <!-- Perforation cue: dashed vertical gold line down the middle, 45% opacity -->
  <line x1="${SIZE / 2}" y1="64" x2="${SIZE / 2}" y2="${SIZE - 64}"
        stroke="${GOLD}" stroke-width="4"
        stroke-dasharray="10 14" opacity="0.45"/>

  <!-- Centered percent sign in brand-gold, bold, ~55% of canvas height -->
  <text x="${SIZE / 2}" y="${SIZE / 2 + 16}"
        text-anchor="middle" dominant-baseline="middle"
        font-family="Helvetica, Arial, sans-serif"
        font-weight="900" font-size="280"
        fill="${GOLD}">%</text>
</svg>`;

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "public", "logo.png");

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, quality: 90 })
  .toFile(out);

const stats = await sharp(out).metadata();
console.log(
  `Wrote ${out} — ${stats.width}×${stats.height} ${stats.format} (${Math.round((stats.size ?? 0) / 1024)}KB)`
);
