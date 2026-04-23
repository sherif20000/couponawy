"use client";

import { useTransition } from "react";
import Link from "next/link";

interface Store {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  logo_url: string | null;
  website_url: string;
  description_ar: string | null;
  status: string;
  is_featured: boolean;
  display_order: number;
}

interface Props {
  store?: Store;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}

export function StoreForm({ store, action, submitLabel }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => action(formData))}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Arabic Name */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            الاسم بالعربي <span className="text-red-500">*</span>
          </label>
          <input
            name="name_ar"
            defaultValue={store?.name_ar}
            required
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent text-sm"
          />
        </div>

        {/* English Name */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            الاسم بالإنجليزي <span className="text-red-500">*</span>
          </label>
          <input
            name="name_en"
            defaultValue={store?.name_en ?? ""}
            required
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
            defaultValue={store?.slug}
            dir="ltr"
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>

        {/* Website URL */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            رابط الموقع <span className="text-red-500">*</span>
          </label>
          <input
            name="website_url"
            type="url"
            defaultValue={store?.website_url ?? ""}
            required
            dir="ltr"
            placeholder="https://example.com"
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            رابط الشعار
          </label>
          <input
            name="logo_url"
            type="url"
            defaultValue={store?.logo_url ?? ""}
            dir="ltr"
            placeholder="https://..."
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
            defaultValue={store?.status ?? "active"}
            className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          >
            <option value="active">نشط</option>
            <option value="paused">موقوف</option>
            <option value="archived">مؤرشف</option>
          </select>
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            ترتيب العرض
          </label>
          <input
            name="display_order"
            type="number"
            defaultValue={store?.display_order ?? 0}
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
          defaultValue={store?.description_ar ?? ""}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-none"
        />
      </div>

      {/* Is Featured */}
      <div className="flex items-center gap-3">
        <select
          name="is_featured"
          defaultValue={store?.is_featured ? "true" : "false"}
          className="h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
        >
          <option value="false">غير مميز</option>
          <option value="true">متجر مميز</option>
        </select>
        <p className="text-sm text-warm-brown/60">
          تظهر المتاجر المميزة في الصفحة الرئيسية
        </p>
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
          href="/admin/stores"
          className="h-10 px-5 rounded-lg border border-charcoal/15 text-sm text-charcoal hover:bg-cream transition-colors flex items-center"
        >
          إلغاء
        </Link>
      </div>
    </form>
  );
}
