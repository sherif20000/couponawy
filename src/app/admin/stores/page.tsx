import Link from "next/link";
import { AdminTopbar } from "@/components/admin/topbar";
import { DeleteButton } from "@/components/admin/delete-button";
import { getAdminStores } from "@/lib/queries/admin";
import { deleteStore } from "./actions";
import { Plus, Pencil } from "lucide-react";
import { StoreLogo } from "@/components/stores/store-logo";

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-500",
};

const statusLabels: Record<string, string> = {
  active: "نشط",
  paused: "موقوف",
  archived: "مؤرشف",
};

export default async function StoresPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const search = params.search ?? "";

  const { stores, total, perPage } = await getAdminStores(page, search);
  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <AdminTopbar title="المتاجر" />
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-warm-brown">
              {total.toLocaleString("ar-EG")} متجر
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <form method="GET" className="flex items-center">
              <input
                name="search"
                defaultValue={search}
                placeholder="بحث بالاسم..."
                className="h-9 px-3 text-sm rounded-lg border border-charcoal/15 bg-white focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent w-52"
              />
            </form>
            <Link
              href="/admin/stores/new"
              className="flex items-center gap-2 h-9 px-4 bg-brand-red text-cream rounded-lg text-sm font-medium hover:bg-brand-red-dark transition-colors"
            >
              <Plus size={14} />
              متجر جديد
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-charcoal/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/8 text-warm-brown text-xs bg-cream/40">
                <th className="text-right px-4 py-3 font-medium">المتجر</th>
                <th className="text-right px-4 py-3 font-medium">الحالة</th>
                <th className="text-right px-4 py-3 font-medium">مميز</th>
                <th className="text-right px-4 py-3 font-medium">الـ Slug</th>
                <th className="text-right px-4 py-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr
                  key={store.id}
                  className="border-b border-charcoal/5 last:border-0 hover:bg-cream/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cream border border-charcoal/8 flex items-center justify-center overflow-hidden shrink-0">
                        <StoreLogo
                          logoUrl={store.logo_url}
                          nameAr={store.name_ar}
                          size="sm"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal">{store.name_ar}</p>
                        {store.name_en && (
                          <p className="text-xs text-warm-brown/60" dir="ltr">
                            {store.name_en}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[store.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabels[store.status] ?? store.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-warm-brown/60">
                    {store.is_featured ? "✓" : "—"}
                  </td>
                  <td className="px-4 py-3 text-warm-brown/60 font-mono text-xs" dir="ltr">
                    {store.slug}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/stores/${store.id}/edit`}
                        className="p-1.5 rounded-lg text-warm-brown hover:bg-brand-red/10 hover:text-brand-red transition-colors"
                      >
                        <Pencil size={14} />
                      </Link>
                      <DeleteButton
                        action={async () => {
                          "use server";
                          await deleteStore(store.id);
                        }}
                        confirmMessage={`هل أنت متأكد من حذف "${store.name_ar}"؟ سيؤدي ذلك إلى حذف جميع كوبوناته أيضاً.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-warm-brown/50"
                  >
                    {search ? "لا توجد نتائج للبحث" : "لا توجد متاجر بعد"}
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
                href={`/admin/stores?page=${page - 1}${search ? `&search=${search}` : ""}`}
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
                href={`/admin/stores?page=${page + 1}${search ? `&search=${search}` : ""}`}
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
