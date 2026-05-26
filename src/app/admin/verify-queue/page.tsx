import Link from "next/link";
import { AdminTopbar } from "@/components/admin/topbar";
import { AutoSubmitSelect } from "@/components/admin/auto-submit-select";
import { getStaleCoupons } from "@/lib/queries/admin";
import { markVerifiedNow, archiveCoupon } from "./actions";
import { CheckCircle2, Archive, Pencil, ExternalLink } from "lucide-react";

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    staleness?: "all" | "never" | "30d" | "60d" | "90d";
  }>;
}

const stalenessOptions = [
  { value: "all", label: "كل النشطة" },
  { value: "never", label: "لم تُتحقّق أبداً" },
  { value: "30d", label: "أكثر من 30 يوم" },
  { value: "60d", label: "أكثر من 60 يوم" },
  { value: "90d", label: "أكثر من 90 يوم" },
];

/**
 * Format days-since-verification as a human pill. Hot = needs action.
 * - never verified → red
 * - >= 90 days     → red (auto-archive imminent)
 * - 60-89 days     → amber
 * - 30-59 days     → blue
 * - < 30 days      → green ("fresh")
 */
function freshnessPill(lastVerifiedAt: string | null) {
  if (!lastVerifiedAt) {
    return {
      label: "لم تُتحقّق",
      className: "bg-red-100 text-red-700",
      days: null as number | null,
    };
  }
  const days = Math.floor(
    (Date.now() - new Date(lastVerifiedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days >= 90) {
    return { label: `${days} يوم`, className: "bg-red-100 text-red-700", days };
  }
  if (days >= 60) {
    return {
      label: `${days} يوم`,
      className: "bg-amber-100 text-amber-800",
      days,
    };
  }
  if (days >= 30) {
    return {
      label: `${days} يوم`,
      className: "bg-blue-100 text-blue-700",
      days,
    };
  }
  return {
    label: `${days} يوم`,
    className: "bg-green-100 text-green-800",
    days,
  };
}

export default async function VerifyQueuePage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const search = params.search ?? "";
  const staleness = (params.staleness ?? "all") as
    | "all"
    | "never"
    | "30d"
    | "60d"
    | "90d";

  const { coupons, total, perPage } = await getStaleCoupons(
    page,
    search,
    staleness
  );
  const totalPages = Math.ceil(total / perPage);

  function filterQs(overrides: Record<string, string | number> = {}) {
    const merged = {
      ...(search ? { search } : {}),
      ...(staleness !== "all" ? { staleness } : {}),
      ...overrides,
    };
    const qs = new URLSearchParams(
      Object.entries(merged).map(([k, v]) => [k, String(v)])
    ).toString();
    return qs ? `?${qs}` : "";
  }

  return (
    <div>
      <AdminTopbar title="قائمة التحقّق" />
      <div className="p-6 space-y-4">
        {/* Header + intent */}
        <div className="bg-cream/60 border border-brand-gold/30 rounded-xl p-4">
          <p className="text-sm text-charcoal font-medium mb-1">
            مراجعة دورية للكوبونات النشطة
          </p>
          <p className="text-xs text-warm-brown leading-relaxed">
            الكوبونات الأقدم تحقّقاً تظهر أولاً. اضغط
            <span className="font-medium text-charcoal">
              {" "}
              «تحقّقت الآن»{" "}
            </span>
            بعد أن تجرّب الكود بنفسك على موقع المتجر، أو اضغط
            <span className="font-medium text-charcoal"> «أرشفة» </span>
            لو الكود توقف عن العمل. الكوبونات المتروكة دون تحقّق لمدة ٩٠ يوم
            ستُؤرشَف تلقائياً يوم الأحد.
          </p>
        </div>

        {/* Filter row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-warm-brown">
            {total.toLocaleString("en-US")} كوبون
          </p>
          <form method="GET" className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="ابحث بالعنوان..."
              className="h-9 px-3 rounded-lg border border-charcoal/15 text-sm bg-white w-56"
            />
            <AutoSubmitSelect
              name="staleness"
              defaultValue={staleness}
              options={stalenessOptions}
              className="w-40"
            />
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-charcoal/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/8 text-warm-brown text-xs bg-cream/40">
                <th className="text-right px-4 py-3 font-medium">العنوان</th>
                <th className="text-right px-4 py-3 font-medium">المتجر</th>
                <th className="text-right px-4 py-3 font-medium">الكود</th>
                <th className="text-right px-4 py-3 font-medium">
                  منذ آخر تحقّق
                </th>
                <th className="text-right px-4 py-3 font-medium">الانتهاء</th>
                <th className="text-right px-4 py-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const store = coupon.store as
                  | { id: string; name_ar: string; slug: string }
                  | null;
                const pill = freshnessPill(coupon.last_verified_at);

                return (
                  <tr
                    key={coupon.id}
                    className="border-b border-charcoal/5 last:border-0 hover:bg-cream/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-charcoal max-w-[240px] truncate">
                      <Link
                        href={`/coupons/${coupon.slug}`}
                        target="_blank"
                        className="hover:text-brand-red transition-colors inline-flex items-center gap-1"
                        title="فتح الصفحة العامة في تبويب جديد"
                      >
                        {coupon.title_ar}
                        <ExternalLink size={11} className="opacity-50" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-warm-brown">
                      {store ? (
                        <Link
                          href={`/stores/${store.slug}`}
                          target="_blank"
                          className="hover:text-brand-red transition-colors"
                        >
                          {store.name_ar}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-warm-brown font-mono text-xs"
                      dir="ltr"
                    >
                      {coupon.code ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${pill.className}`}
                      >
                        {pill.label}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-warm-brown/60 text-xs"
                      dir="ltr"
                    >
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString(
                            "ar-SA-u-nu-latn"
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Verified now */}
                        <form
                          action={async () => {
                            "use server";
                            await markVerifiedNow(coupon.id);
                          }}
                        >
                          <button
                            type="submit"
                            title="تحقّقت الآن — يصفّر العداد"
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition-colors"
                          >
                            <CheckCircle2 size={12} />
                            تحقّقت
                          </button>
                        </form>

                        {/* Archive */}
                        <form
                          action={async () => {
                            "use server";
                            await archiveCoupon(coupon.id);
                          }}
                        >
                          <button
                            type="submit"
                            title="أرشفة — الكوبون لم يعد يعمل"
                            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium transition-colors"
                          >
                            <Archive size={12} />
                            أرشفة
                          </button>
                        </form>

                        {/* Edit */}
                        <Link
                          href={`/admin/coupons/${coupon.id}/edit`}
                          className="p-1.5 rounded-lg text-warm-brown hover:bg-brand-red/10 hover:text-brand-red transition-colors"
                          title="تعديل"
                        >
                          <Pencil size={12} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {coupons.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-warm-brown/50"
                  >
                    {search || staleness !== "all"
                      ? "لا توجد نتائج تطابق الفلاتر المحددة"
                      : "كل الكوبونات النشطة محدّثة — أحسنت!"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {page > 1 && (
              <Link
                href={`/admin/verify-queue${filterQs({ page: page - 1 })}`}
                className="h-9 px-3 rounded-lg border border-charcoal/15 text-sm hover:bg-cream/60 transition-colors"
              >
                السابق
              </Link>
            )}
            <span className="text-sm text-warm-brown px-3">
              {page.toLocaleString("en-US")} / {totalPages.toLocaleString("en-US")}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin/verify-queue${filterQs({ page: page + 1 })}`}
                className="h-9 px-3 rounded-lg border border-charcoal/15 text-sm hover:bg-cream/60 transition-colors"
              >
                التالي
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
