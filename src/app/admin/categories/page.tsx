import Link from "next/link";
import { AdminTopbar } from "@/components/admin/topbar";
import { DeleteButton } from "@/components/admin/delete-button";
import { getAdminCategories } from "@/lib/queries/admin";
import { createCategory, deleteCategory } from "./actions";
import { Pencil } from "lucide-react";

export default async function CategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <AdminTopbar title="التصنيفات" />
      <div className="p-6 max-w-2xl space-y-6">
        {/* Add Form */}
        <section>
          <h2 className="text-sm font-semibold text-warm-brown uppercase tracking-wider mb-4">
            إضافة تصنيف جديد
          </h2>
          <form action={createCategory} className="bg-white rounded-xl border border-charcoal/8 p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-warm-brown mb-1">
                  الاسم بالعربي <span className="text-red-500">*</span>
                </label>
                <input
                  name="name_ar"
                  required
                  className="w-full h-9 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-brown mb-1">
                  الاسم بالإنجليزي
                </label>
                <input
                  name="name_en"
                  dir="ltr"
                  className="w-full h-9 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-brown mb-1">
                  Slug
                </label>
                <input
                  name="slug"
                  dir="ltr"
                  className="w-full h-9 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-brown mb-1">
                  أيقونة (emoji أو اسم)
                </label>
                <input
                  name="icon"
                  className="w-full h-9 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-brown mb-1">
                  ترتيب العرض
                </label>
                <input
                  name="display_order"
                  type="number"
                  defaultValue={0}
                  className="w-full h-9 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              className="h-9 px-5 bg-brand-red text-cream rounded-lg text-sm font-semibold hover:bg-brand-red-dark transition-colors"
            >
              إضافة التصنيف
            </button>
          </form>
        </section>

        {/* List */}
        <section>
          <h2 className="text-sm font-semibold text-warm-brown uppercase tracking-wider mb-4">
            التصنيفات الحالية ({categories.length})
          </h2>
          <div className="bg-white rounded-xl border border-charcoal/8 divide-y divide-charcoal/5">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  {cat.icon && (
                    <span className="text-lg">{cat.icon}</span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-charcoal">{cat.name_ar}</p>
                    <p className="text-xs text-warm-brown/50 font-mono" dir="ltr">
                      {cat.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-warm-brown/40">
                    ترتيب: {cat.display_order}
                  </span>
                  <Link
                    href={`/admin/categories/${cat.id}/edit`}
                    className="p-1.5 rounded-lg text-warm-brown hover:bg-brand-red/10 hover:text-brand-red transition-colors"
                  >
                    <Pencil size={14} />
                  </Link>
                  <DeleteButton
                    action={async () => {
                      "use server";
                      await deleteCategory(cat.id);
                    }}
                    confirmMessage={`هل أنت متأكد من حذف تصنيف "${cat.name_ar}"؟`}
                  />
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="px-4 py-8 text-center text-warm-brown/50 text-sm">
                لا توجد تصنيفات بعد
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
