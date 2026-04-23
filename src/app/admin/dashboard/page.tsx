import { AdminTopbar } from "@/components/admin/topbar";
import {
  getAdminStats,
  getRecentCoupons,
  getTopStores,
} from "@/lib/queries/admin";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-charcoal/8">
      <p className="text-xs text-warm-brown font-medium mb-1">{label}</p>
      <p className="text-3xl font-display font-bold text-charcoal">
        {value.toLocaleString("ar-EG")}
      </p>
      {sub && <p className="text-xs text-warm-brown/60 mt-1">{sub}</p>}
    </div>
  );
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-600",
  paused: "bg-yellow-100 text-yellow-800",
  expired: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  active: "نشط",
  draft: "مسودة",
  paused: "موقوف",
  expired: "منتهي",
};

export default async function DashboardPage() {
  const [stats, recentCoupons, topStores] = await Promise.all([
    getAdminStats(),
    getRecentCoupons(8),
    getTopStores(5),
  ]);

  return (
    <div>
      <AdminTopbar title="لوحة التحكم" />
      <div className="p-6 space-y-8">
        {/* KPI Grid */}
        <section>
          <h2 className="text-sm font-semibold text-warm-brown uppercase tracking-wider mb-4">
            نظرة عامة
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="الكوبونات النشطة"
              value={stats.activeCoupons}
              sub={`من ${stats.totalCoupons.toLocaleString("ar-EG")} إجمالي`}
            />
            <StatCard
              label="المتاجر النشطة"
              value={stats.activeStores}
              sub={`من ${stats.totalStores.toLocaleString("ar-EG")} إجمالي`}
            />
            <StatCard label="التصنيفات" value={stats.totalCategories} />
            <StatCard
              label="إجمالي الكشف"
              value={stats.totalReveals}
              sub="عدد مرات مشاهدة الكوبونات"
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-warm-brown uppercase tracking-wider mb-4">
            البلاغات والرسائل
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="تقارير الكوبونات"
              value={stats.totalReports}
              sub="بلاغات مُرسَلة من المستخدمين"
            />
            <StatCard
              label="رسائل التواصل"
              value={stats.totalMessages}
              sub="رسائل واردة من صفحة اتصل بنا"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Coupons */}
          <section className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-warm-brown uppercase tracking-wider mb-4">
              آخر الكوبونات
            </h2>
            <div className="bg-white rounded-xl border border-charcoal/8 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal/8 text-warm-brown text-xs">
                    <th className="text-right px-4 py-3 font-medium">الكوبون</th>
                    <th className="text-right px-4 py-3 font-medium">المتجر</th>
                    <th className="text-right px-4 py-3 font-medium">الحالة</th>
                    <th className="text-right px-4 py-3 font-medium">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCoupons.map((c) => {
                    const store = c.store as { name_ar: string } | null;
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-charcoal/5 last:border-0 hover:bg-cream/60 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-charcoal truncate max-w-[200px]">
                          {c.title_ar}
                        </td>
                        <td className="px-4 py-3 text-warm-brown">
                          {store?.name_ar ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[c.status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {statusLabels[c.status] ?? c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-warm-brown/60 text-xs" dir="ltr">
                          {formatDistanceToNow(new Date(c.created_at), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </td>
                      </tr>
                    );
                  })}
                  {recentCoupons.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-warm-brown/50"
                      >
                        لا توجد كوبونات بعد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Top Stores */}
          <section>
            <h2 className="text-sm font-semibold text-warm-brown uppercase tracking-wider mb-4">
              أبرز المتاجر
            </h2>
            <div className="bg-white rounded-xl border border-charcoal/8 divide-y divide-charcoal/5">
              {topStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.name_ar}
                      className="w-8 h-8 rounded-lg object-contain bg-cream"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-brand-red/10 flex items-center justify-center text-brand-red font-bold text-sm">
                      {store.name_ar[0]}
                    </div>
                  )}
                  <span className="text-sm font-medium text-charcoal">
                    {store.name_ar}
                  </span>
                </div>
              ))}
              {topStores.length === 0 && (
                <p className="px-4 py-8 text-center text-warm-brown/50 text-sm">
                  لا توجد متاجر بعد
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
