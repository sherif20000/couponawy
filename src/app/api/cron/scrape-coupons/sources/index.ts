// Active coupon sources. Order matters only for log readability —
// the cron route runs all sources in parallel per store.
//
// To add a source: implement CouponSource (see ./types.ts), then push it
// into SOURCES. The route handler will pick it up automatically.

import { couponava } from "./couponava";
import { arabiccoupon } from "./arabiccoupon";
import { alcoupon } from "./alcoupon";
import { codekhasem } from "./codekhasem";
import type { CouponSource } from "./types";

export const SOURCES: CouponSource[] = [couponava, arabiccoupon, alcoupon, codekhasem];

export type { CouponSource, ScrapedCoupon, SourceResult } from "./types";
