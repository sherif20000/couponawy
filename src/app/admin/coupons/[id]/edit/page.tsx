import { AdminTopbar } from "@/components/admin/topbar";
import { CouponForm } from "@/components/admin/coupon-form";
import { getCouponById, getStoresForSelect } from "@/lib/queries/admin";
import { updateCoupon } from "../../actions";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditCouponPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const [coupon, stores] = await Promise.all([
    getCouponById(id),
    getStoresForSelect(),
  ]);

  if (!coupon) notFound();

  const boundAction = updateCoupon.bind(null, id);

  return (
    <div>
      <AdminTopbar title={`تعديل: ${coupon.title_ar}`} />
      <div className="p-6 max-w-2xl space-y-4">
        {sp.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-700 text-sm">حدث خطأ أثناء الحفظ. تأكد من عدم تكرار الـ slug وحاول مجدداً.</p>
          </div>
        )}
        <CouponForm
          coupon={coupon}
          stores={stores}
          action={boundAction}
          submitLabel="حفظ التغييرات"
        />
      </div>
    </div>
  );
}
