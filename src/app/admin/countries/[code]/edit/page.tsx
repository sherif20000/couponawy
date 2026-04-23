import { AdminTopbar } from "@/components/admin/topbar";
import { getCountryByCode } from "@/lib/queries/admin";
import { updateCountry } from "../../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Database } from "@/types/database";

type CountryStatus = Database["public"]["Enums"]["country_status"];

interface Props {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditCountryPage({ params, searchParams }: Props) {
  const { code } = await params;
  const sp = await searchParams;
  const country = await getCountryByCode(code);

  if (!country) notFound();

  const boundAction = updateCountry.bind(null, code);

  return (
    <div>
      <AdminTopbar title={`تعديل: ${country.name_ar}`} />
      <div className="p-6 max-w-xl">
        {sp.error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-700 text-sm">حدث خطأ أثناء الحفظ. حاول مرة أخرى.</p>
          </div>
        )}

        <div className="mb-4 bg-cream border border-charcoal/10 rounded-xl px-4 py-3">
          <p className="text-xs text-warm-brown">
            رمز الدولة: <span className="font-mono font-semibold text-charcoal">{country.code}</span>
            <span className="mr-2 text-warm-brown/50">(لا يمكن تغيير الرمز)</span>
          </p>
        </div>

        <form action={boundAction} className="bg-white rounded-xl border border-charcoal/8 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                الاسم بالعربي <span className="text-red-500">*</span>
              </label>
              <input
                name="name_ar"
                defaultValue={country.name_ar}
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
                defaultValue={country.name_en}
                dir="ltr"
                className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                hreflang
              </label>
              <input
                name="hreflang"
                defaultValue={country.hreflang}
                dir="ltr"
                placeholder="ar-SA"
                className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                العلم (emoji)
              </label>
              <input
                name="flag_emoji"
                defaultValue={country.flag_emoji ?? ""}
                className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                رمز العملة <span className="text-red-500">*</span>
              </label>
              <input
                name="currency"
                defaultValue={country.currency}
                required
                dir="ltr"
                placeholder="SAR"
                className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                رمز العملة (symbol) <span className="text-red-500">*</span>
              </label>
              <input
                name="currency_symbol"
                defaultValue={country.currency_symbol}
                required
                dir="ltr"
                placeholder="ر.س"
                className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                الحالة
              </label>
              <select
                name="status"
                defaultValue={country.status as CountryStatus}
                className="w-full h-10 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
              >
                <option value="active">نشط</option>
                <option value="coming_soon">قريباً</option>
                <option value="disabled">معطّل</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">
                ترتيب العرض
              </label>
              <input
                name="display_order"
                type="number"
                defaultValue={country.display_order}
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
              href="/admin/countries"
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
