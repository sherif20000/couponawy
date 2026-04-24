import Link from "next/link";
import { AdminTopbar } from "@/components/admin/topbar";
import { getAdminCountries } from "@/lib/queries/admin";
import { toggleCountryStatus, createCountry, deleteCountry } from "./actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pencil } from "lucide-react";
import type { Database } from "@/types/database";

type CountryStatus = Database["public"]["Enums"]["country_status"];

const statusColors: Record<CountryStatus, string> = {
  active: "bg-green-100 text-green-800",
  coming_soon: "bg-yellow-100 text-yellow-800",
  disabled: "bg-gray-100 text-gray-500",
};

const statusLabels: Record<CountryStatus, string> = {
  active: "نشط",
  coming_soon: "قريباً",
  disabled: "معطّل",
};

const nextStatusLabels: Record<CountryStatus, string> = {
  active: "تحويل إلى قريباً",
  coming_soon: "تعطيل",
  disabled: "تفعيل",
};

export default async function CountriesPage() {
  const countries = await getAdminCountries();

  return (
    <div>
      <AdminTopbar title="الدول" />
      <div className="p-6 max-w-2xl space-y-6">
        {/* Add Form */}
        <section>
          <h2 className="text-sm font-semibold text-warm-brown uppercase tracking-wider mb-4">
            إضافة دولة جديدة
          </h2>
          <form action={createCountry} className="bg-white rounded-xl border border-charcoal/8 p-5 space-y-4">
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
                  رمز الدولة (SA, EG...) <span className="text-red-500">*</span>
                </label>
                <input
                  name="code"
                  required
                  dir="ltr"
                  maxLength={3}
                  className="w-full h-9 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal font-mono uppercase text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-brown mb-1">
                  hreflang (ar-SA...)
                </label>
                <input
                  name="hreflang"
                  dir="ltr"
                  placeholder="ar-SA"
                  className="w-full h-9 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-brown mb-1">
                  العلم (emoji)
                </label>
                <input
                  name="flag_emoji"
                  className="w-full h-9 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  placeholder="🇸🇦"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-brown mb-1">
                  رمز العملة <span className="text-red-500">*</span>
                </label>
                <input
                  name="currency"
                  required
                  dir="ltr"
                  placeholder="SAR"
                  className="w-full h-9 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-brown mb-1">
                  رمز العملة (symbol) <span className="text-red-500">*</span>
                </label>
                <input
                  name="currency_symbol"
                  required
                  dir="ltr"
                  placeholder="ر.س"
                  className="w-full h-9 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-warm-brown mb-1">
                  الحالة
                </label>
                <select
                  name="status"
                  defaultValue="coming_soon"
                  className="w-full h-9 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                >
                  <option value="active">نشط</option>
                  <option value="coming_soon">قريباً</option>
                  <option value="disabled">معطّل</option>
                </select>
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
              إضافة الدولة
            </button>
          </form>
        </section>

        {/* List */}
        <section>
          <h2 className="text-sm font-semibold text-warm-brown uppercase tracking-wider mb-4">
            الدول الحالية ({countries.length})
          </h2>
          <div className="bg-white rounded-xl border border-charcoal/8 divide-y divide-charcoal/5">
            {countries.map((country) => (
              <div
                key={country.code}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {country.flag_emoji && (
                    <span className="text-xl">{country.flag_emoji}</span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {country.name_ar}
                    </p>
                    <p className="text-xs text-warm-brown/50 font-mono" dir="ltr">
                      {country.code} · {country.currency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[country.status]
                    }`}
                  >
                    {statusLabels[country.status]}
                  </span>
                  <form
                    action={async () => {
                      "use server";
                      await toggleCountryStatus(country.code, country.status);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-xs px-3 h-7 rounded-lg border border-charcoal/15 text-warm-brown hover:bg-cream transition-colors"
                    >
                      {nextStatusLabels[country.status]}
                    </button>
                  </form>
                  <Link
                    href={`/admin/countries/${country.code}/edit`}
                    className="p-1.5 rounded-lg text-warm-brown hover:bg-brand-red/10 hover:text-brand-red transition-colors"
                  >
                    <Pencil size={14} />
                  </Link>
                  <DeleteButton
                    action={async () => {
                      "use server";
                      await deleteCountry(country.code);
                    }}
                    confirmMessage={`هل أنت متأكد من حذف "${country.name_ar}"؟`}
                  />
                </div>
              </div>
            ))}
            {countries.length === 0 && (
              <p className="px-4 py-8 text-center text-warm-brown/50 text-sm">
                لا توجد دول بعد
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
