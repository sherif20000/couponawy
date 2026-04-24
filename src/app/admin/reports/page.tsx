import Link from "next/link";
import { AdminTopbar } from "@/components/admin/topbar";
import { DeleteButton } from "@/components/admin/delete-button";
import { getCouponReports } from "@/lib/queries/admin";
import { deleteReport } from "./actions";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const issueLabels: Record<string, string> = {
  expired: "منتهي الصلاحية",
  not_working: "لا يعمل",
  incorrect: "معلومات غير صحيحة",
  other: "مشكلة أخرى",
};

const issueColors: Record<string, string> = {
  expired: "bg-orange-100 text-orange-800",
  not_working: "bg-red-100 text-red-800",
  incorrect: "bg-yellow-100 text-yellow-800",
  other: "bg-gray-100 text-gray-600",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminReportsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { reports, total, perPage } = await getCouponReports(page);
  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <AdminTopbar title="تقارير الكوبونات" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-warm-brown">
            إجمالي التقارير:{" "}
            <span className="font-bold text-charcoal">
              {total.toLocaleString("ar-EG")}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-charcoal/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/8 text-warm-brown text-xs">
                <th className="text-right px-4 py-3 font-medium">نوع المشكلة</th>
                <th className="text-right px-4 py-3 font-medium">الكوبون / الرابط</th>
                <th className="text-right px-4 py-3 font-medium">ملاحظة</th>
                <th className="text-right px-4 py-3 font-medium">التاريخ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-charcoal/5 last:border-0 hover:bg-cream/60 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        issueColors[r.issue_type] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {issueLabels[r.issue_type] ?? r.issue_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-warm-brown/80 max-w-[220px]">
                    {r.coupon_url ? (
                      <a
                        href={r.coupon_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate block text-xs font-mono text-brand-red hover:underline"
                        dir="ltr"
                        title={r.coupon_url}
                      >
                        {r.coupon_url}
                      </a>
                    ) : (
                      <span className="text-warm-brown/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-warm-brown/80 max-w-[280px]">
                    {r.note ? (
                      <span className="line-clamp-2 text-xs">{r.note}</span>
                    ) : (
                      <span className="text-warm-brown/30">—</span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 text-warm-brown/50 text-xs whitespace-nowrap"
                    dir="ltr"
                  >
                    {formatDistanceToNow(new Date(r.created_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <DeleteButton
                      action={async () => {
                        "use server";
                        await deleteReport(r.id);
                      }}
                      confirmMessage="هل أنت متأكد من حذف هذا البلاغ؟"
                    />
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-warm-brown/40"
                  >
                    لا توجد تقارير بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/reports?page=${page - 1}`}
                className="px-3 py-1.5 rounded-lg border border-charcoal/10 text-sm text-charcoal hover:bg-cream transition-colors"
              >
                السابق
              </Link>
            )}
            <span className="text-sm text-warm-brown">
              صفحة {page} من {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin/reports?page=${page + 1}`}
                className="px-3 py-1.5 rounded-lg border border-charcoal/10 text-sm text-charcoal hover:bg-cream transition-colors"
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
