"use client";

import { useTransition } from "react";
import Link from "next/link";

interface Store {
  id: string;
  name_ar: string;
}

interface Coupon {
  id: string;
  title_ar: string;
  title_en: string | null;
  slug: string;
  code: string | null;
  store_id: string;
  destination_url: string;
  discount_type: string;
  discount_value: number | null;
  discount_display: string | null;
  description_ar: string | null;
  status: string;
  is_featured: boolean;
  expires_at: string | null;
  display_order: number;
}

interface Props {
  coupon?: Coupon;
  stores: Store[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}

export function CouponForm({ coupon, stores, action, submitLabel }: Props) {
  const [pending, startTransition] = useTransition();

  const expiresValue = coupon?.expires_at
    ? new Date(coupon.expires_at).toISOString().slice(0, 10)
    : "";

  return (
    <form
      action={(formData) => startTransition(() => action(formData))}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Arabic Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            العنوان بالعربي <span className="text-red-500">*</span>
          </label>
          <input
            name="title_ar"
            defaultValue={coupon?.title_ar}
            required
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent text-sm"
          />
        </div>

        {/* English Title */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            العنوان بالإنجليزي
          </label>
          <input
            name="title_en"
            defaultValue={coupon?.title_en ?? ""}
            dir="ltr"
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent text-sm"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            Slug{" "}
            <span className="text-warm-brown/50 text-xs font-normal">
              (يُولَّد تلقائياً)
            </span>
          </label>
          <input
            name="slug"
            defaultValue={coupon?.slug}
            dir="ltr"
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>

        {/* Code */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            كود الكوبون
          </label>
          <input
            name="code"
            defaultValue={coupon?.code ?? ""}
            dir="ltr"
            placeholder="SAVE20"
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent tracking-wider"
          />
        </div>

        {/* Destination URL */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            رابط الوجهة <span className="text-red-500">*</span>
          </label>
          <input
            name="destination_url"
            type="url"
            defaultValue={coupon?.destination_url ?? ""}
            required
            dir="ltr"
            placeholder="https://store.com/deal"
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>

        {/* Store */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            المتجر <span className="text-red-500">*</span>
          </label>
          <select
            name="store_id"
            defaultValue={coupon?.store_id ?? ""}
            required
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          >
            <option value="">— اختر متجراً —</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name_ar}
              </option>
            ))}
          </select>
        </div>

        {/* Discount Type */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            نوع الخصم
          </label>
          <select
            name="discount_type"
            defaultValue={coupon?.discount_type ?? "other"}
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          >
            <option value="percentage">نسبة مئوية (%)</option>
            <option value="fixed">مبلغ ثابت</option>
            <option value="free_shipping">شحن مجاني</option>
            <option value="bogo">اشترِ واحداً واحصل على آخر</option>
            <option value="other">أخرى</option>
          </select>
        </div>

        {/* Discount Value */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            قيمة الخصم
          </label>
          <input
            name="discount_value"
            type="number"
            step="0.01"
            defaultValue={coupon?.discount_value ?? ""}
            dir="ltr"
            placeholder="20"
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>

        {/* Discount Display */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            نص الخصم (للعرض)
          </label>
          <input
            name="discount_display"
            defaultValue={coupon?.discount_display ?? ""}
            placeholder="مثل: خصم 20%"
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            الحالة
          </label>
          <select
            name="status"
            defaultValue={coupon?.status ?? "draft"}
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          >
            <option value="draft">مسودة</option>
            <option value="active">نشط</option>
            <option value="paused">موقوف</option>
            <option value="expired">منتهي</option>
          </select>
        </div>

        {/* Expires At */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            تاريخ الانتهاء
          </label>
          <input
            name="expires_at"
            type="date"
            defaultValue={expiresValue}
            dir="ltr"
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            ترتيب العرض
          </label>
          <input
            name="display_order"
            type="number"
            defaultValue={coupon?.display_order ?? 0}
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5">
          الوصف
        </label>
        <textarea
          name="description_ar"
          defaultValue={coupon?.description_ar ?? ""}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-none"
        />
      </div>

      {/* Is Featured */}
      <div>
        <select
          name="is_featured"
          defaultValue={coupon?.is_featured ? "true" : "false"}
          className="h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
        >
          <option value="false">غير مميز</option>
          <option value="true">كوبون مميز</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="h-10 px-6 bg-brand-red text-cream rounded-lg text-sm font-semibold hover:bg-brand-red-dark transition-colors disabled:opacity-50"
        >
          {pending ? "جارٍ الحفظ..." : submitLabel}
        </button>
        <Link
          href="/admin/coupons"
          className="h-10 px-5 rounded-lg border border-charcoal/15 text-sm text-charcoal hover:bg-cream transition-colors flex items-center"
        >
          إلغاء
        </Link>
      </div>
    </form>
  );
}
