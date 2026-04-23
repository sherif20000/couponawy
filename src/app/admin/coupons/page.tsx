import Link from "next/link";
import { AdminTopbar } from "@/components/admin/topbar";
import { AutoSubmitSelect } from "@/components/admin/auto-submit-select";
import { DeleteButton } from "@/components/admin/delete-button";
import { getAdminCoupons } from "@/lib/queries/admin";
import { deleteCoupon, toggleCouponStatus } from "./actions";
import { Plus, Pencil } from "lucide-react";

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    store_id?: string;
    status?: string;
  }>;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-500",
  paused: "bg-yellow-100 text-yellow-800",
  expired: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  active: "نشط",
  draft: "مسودة",
  paused: "موقوف",
  expired: "منتهي",
};

const statusOptions = [
  { value: "active", label: "نشط" },
  { value: "draft", label: "مسودة" },
  { value: "paused", label: "موقوف" },
  { value: "expired", label: "منتهي" },
];

export default async function CouponsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const search = params.search ?? "";
  const storeId = params.store_id ?? "";
  const status = params.status ?? "";

  const { coupons, total, perPage } = await getAdminCoupons(
    page,
    search,
    storeId,
    status
  );
  const totalPages = Math.ceil(total / perPage);

  // Build a query string that preserves all active filters (used in pagination links)
  function filterQs(overrides: Record<string, string | number> = {}) {
    const merged = {
      ...(search ? { search } : {}),
      ...(storeId ? { store_id: storeId } : {}),
      ...(status ? { status } : {}),
      ...overrides,
    };
    const qs = new URLSearchParams(
      Object.entries(merged).map(([k, v]) => [k, String(v)])
    ).toString();
    return qs ? `?${qs}` : "";
  }

  return (
    <div>
      <AdminTopbar title="الكوبونات" />
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-warm-brown">
            {total.toLocaleString("ar-EG")} كوبون
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <form method="GET" className="flex items-center gap-2">
              {/* Preserve storeId as hidden input if set */}
              {storeId && <input type="hidden" name="store_id" value={storeId} />}

              <input
                name="search"
                defaultValue={search}
                placeholder="بحث بالعنوان..."
                className="h-9 px-3 text-sm rounded-lg border border-charcoal/15 bg-white focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent w-48"
              />

              <AutoSubmitSelect
                name="status"
                defaultValue={status}
                options={statusOptions}
                placeholder="كل الحالات"
                className="w-36"
              />
            </form>

            <Link
              href="/admin/coupons/new"
              className="flex items-center gap-2 h-9 px-4 bg-brand-red text-cream rounded-lg text-sm font-medium hover:bg-brand-red-dark transition-colors"
            >
              <Plus size={14} />
              كوبون جديد
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-charcoal/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/8 text-warm-brown text-xs bg-cream/40">
                <th className="text-right px-4 py-3 font-medium">العنوان</th>
                <th className="text-right px-4 py-3 font-medium">المتجر</th>
                <th className="text-right px-4 py-3 font-medium">الخصم</th>
                <th className="text-right px-4 py-3 font-medium">الحالة</th>
                <th className="text-right px-4 py-3 font-medium">الانتهاء</th>
                <th className="text-right px-4 py-3 font-medium">الكشف</th>
                <th className="text-right px-4 py-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const store = coupon.store as { id: string; name_ar: string } | null;
                const canToggle = coupon.status !== "expired";

                return (
                  <tr
                    key={coupon.id}
                    className="border-b border-charcoal/5 last:border-0 hover:bg-cream/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-charcoal max-w-[220px] truncate">
                      {coupon.title_ar}
                    </td>
                    <td className="px-4 py-3 text-warm-brown">
                      {store?.name_ar ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-warm-brown font-mono text-xs">
                      {coupon.discount_display ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {canToggle ? (
                        <form
                          action={async () => {
                            "use server";
                            await toggleCouponStatus(
                              coupon.id,
                              coupon.status as "active" | "paused" | "draft" | "expired"
                            );
                          }}
                        >
                          <button
                            type="submit"
                            title="اضغط لتغيير الحالة"
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-75 transition-opacity ${
                              statusColors[coupon.status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {statusLabels[coupon.status] ?? coupon.status}
                          </button>
                        </form>
                      ) : (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[coupon.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {statusLabels[coupon.status] ?? coupon.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-warm-brown/60 text-xs" dir="ltr">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString("ar-EG")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-warm-brown/60 text-xs">
                      {(coupon.reveal_count ?? 0).toLocaleString("ar-EG")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/coupons/${coupon.id}/edit`}
                          className="p-1.5 rounded-lg text-warm-brown hover:bg-brand-red/10 hover:text-brand-red transition-colors"
                        >
                          <Pencil size={14} />
                        </Link>
                        <DeleteButton
                          action={async () => {
                            "use server";
                            await deleteCoupon(coupon.id);
                          }}
                          confirmMessage={`هل أنت متأكد من حذف "${coupon.title_ar}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {coupons.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-warm-brown/50"
                  >
                    {search || status
                      ? "لا توجد نتائج تطابق الفلاتر المحددة"
                      : "لا توجد كوبونات بعد"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/coupons${filterQs({ page: page - 1 })}`}
                className="px-3 py-1.5 text-sm rounded-lg border border-charcoal/15 hover:bg-cream transition-colors"
              >
                السابق
              </Link>
            )}
            <span className="text-sm text-warm-brown">
              صفحة {page} من {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin/coupons${filterQs({ page: page + 1 })}`}
                className="px-3 py-1.5 text-sm rounded-lg border border-charcoal/15 hover:bg-cream transition-colors"
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
