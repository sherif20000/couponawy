import { AdminTopbar } from "@/components/admin/topbar";
import { getCategoryById } from "@/lib/queries/admin";
import { updateCategory } from "../../actions";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditCategoryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const category = await getCategoryById(id);

  if (!category) notFound();

  const boundAction = updateCategory.bind(null, id);

  return (
    <div>
      <AdminTopbar title={`تعديل: ${category.name_ar}`} />
      <div className="p-6 max-w-xl">
        {sp.error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-700 text-sm">حدث خطأ أثناء الحفظ. حاول مرة أخرى.</p>
          </div>
        )}

        <form action={boundAction} className="bg-white rounded-xl border border-charcoal/8 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                الاسم بالعربي <span className="text-red-500">*</span>
              </label>
              <input
                name="name_ar"
                defaultValue={category.name_ar}
                required
                className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                الاسم بالإنجليزي
              </label>
              <input
                name="name_en"
                defaultValue={category.name_en ?? ""}
                dir="ltr"
                className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                Slug
              </label>
              <input
                name="slug"
                defaultValue={category.slug}
                dir="ltr"
                className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                أيقونة (emoji أو اسم)
              </label>
              <input
                name="icon"
                defaultValue={category.icon ?? ""}
                className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                ترتيب العرض
              </label>
              <input
                name="display_order"
                type="number"
                defaultValue={category.display_order}
                className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="h-10 px-6 bg-brand-red text-cream rounded-lg text-sm font-semibold hover:bg-brand-red-dark transition-colors"
            >
              حفظ التغييرات
            </button>
            <Link
              href="/admin/categories"
              className="h-10 px-5 rounded-lg border border-charcoal/15 text-sm text-charcoal hover:bg-cream transition-colors flex items-center"
            >
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
