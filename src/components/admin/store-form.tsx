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
  short_description_ar: string | null;
  description_ar: string | null;
  status: string;
  is_featured: boolean;
  is_verified: boolean;
  display_order: number;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  rating: number | null;
  review_count: number | null;
  editorial_intro_ar: string | null;
  seasonal_calendar_ar: string | null;
  shipping_info_ar: string | null;
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

        {/* Logo URL + preview */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            رابط الشعار
          </label>
          <div className="flex gap-2 items-center">
            {store?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logo_url}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                className="h-10 w-10 rounded-lg border border-charcoal/15 object-contain bg-white shrink-0"
              />
            )}
            <input
              name="logo_url"
              type="url"
              defaultValue={store?.logo_url ?? ""}
              dir="ltr"
              placeholder="https://..."
              className="flex-1 h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
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

      {/* Short description (shown in store hero) */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5">
          وصف مختصر{" "}
          <span className="text-warm-brown/50 text-xs font-normal">
            (يظهر في رأس صفحة المتجر)
          </span>
        </label>
        <textarea
          name="short_description_ar"
          defaultValue={store?.short_description_ar ?? ""}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-none"
        />
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5">
          وصف تفصيلي{" "}
          <span className="text-warm-brown/50 text-xs font-normal">
            (يظهر في أسفل صفحة المتجر)
          </span>
        </label>
        <textarea
          name="description_ar"
          defaultValue={store?.description_ar ?? ""}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-none"
        />
      </div>

      {/* ── Editorial overrides ─────────────────────────────────────
          Three optional long-form Arabic textareas that override the
          programmatic templates on the store's public page. Leave empty to
          fall back to template-generated copy. Markdown-lite: use **bold**
          and double-newlines for paragraph breaks. Target word counts are
          guidance, not enforced. */}
      <details className="border border-charcoal/15 rounded-xl bg-white/40 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-charcoal">
          محتوى تحريري طويل (اختياري — يستبدل القوالب)
        </summary>
        <div className="mt-4 space-y-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              مقدمة تحريرية{" "}
              <span className="text-warm-brown/50 text-xs font-normal">
                (400-500 كلمة · يستبدل قسم «عن المتجر»)
              </span>
            </label>
            <textarea
              name="editorial_intro_ar"
              defaultValue={store?.editorial_intro_ar ?? ""}
              rows={8}
              className="w-full px-3 py-2 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              تقويم الخصومات الموسمية{" "}
              <span className="text-warm-brown/50 text-xs font-normal">
                (400-500 كلمة · رمضان، الجمعة البيضاء، إلخ)
              </span>
            </label>
            <textarea
              name="seasonal_calendar_ar"
              defaultValue={store?.seasonal_calendar_ar ?? ""}
              rows={8}
              className="w-full px-3 py-2 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              دليل الشحن والدفع{" "}
              <span className="text-warm-brown/50 text-xs font-normal">
                (300-400 كلمة · توقيت التوصيل، الدفع، الإرجاع)
              </span>
            </label>
            <textarea
              name="shipping_info_ar"
              defaultValue={store?.shipping_info_ar ?? ""}
              rows={8}
              className="w-full px-3 py-2 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-y"
            />
          </div>
        </div>
      </details>

      {/* Flags row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <select
            name="is_featured"
            defaultValue={store?.is_featured ? "true" : "false"}
            className="h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          >
            <option value="false">غير مميز</option>
            <option value="true">متجر مميز</option>
          </select>
          <p className="text-sm text-warm-brown/60">يظهر في الصفحة الرئيسية</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            name="is_verified"
            defaultValue={store?.is_verified ? "true" : "false"}
            className="h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          >
            <option value="false">غير موثّق</option>
            <option value="true">متجر موثّق</option>
          </select>
          <p className="text-sm text-warm-brown/60">يُظهر شارة "موثّق"</p>
        </div>
      </div>

      {/* Trust / Rating */}
      <div>
        <p className="text-sm font-semibold text-charcoal mb-3">التقييم</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              التقييم{" "}
              <span className="text-warm-brown/50 text-xs font-normal">(1–5)</span>
            </label>
            <input
              name="rating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              defaultValue={store?.rating ?? ""}
              placeholder="4.5"
              className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              عدد التقييمات
            </label>
            <input
              name="review_count"
              type="number"
              min="0"
              defaultValue={store?.review_count ?? ""}
              placeholder="1240"
              className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div>
        <p className="text-sm font-semibold text-charcoal mb-3">SEO</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              عنوان الصفحة (meta title)
            </label>
            <input
              name="meta_title"
              defaultValue={store?.meta_title ?? ""}
              dir="rtl"
              placeholder={store ? `كوبونات ${store.name_ar} وعروض الخصم` : ""}
              className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              وصف الصفحة (meta description)
            </label>
            <textarea
              name="meta_description"
              defaultValue={store?.meta_description ?? ""}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              صورة المشاركة (og:image)
            </label>
            <input
              name="og_image"
              type="url"
              defaultValue={store?.og_image ?? ""}
              dir="ltr"
              placeholder="https://..."
              className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
            />
          </div>
        </div>
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
