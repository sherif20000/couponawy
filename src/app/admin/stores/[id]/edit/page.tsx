import { AdminTopbar } from "@/components/admin/topbar";
import { StoreForm } from "@/components/admin/store-form";
import { getStoreById } from "@/lib/queries/admin";
import { updateStore } from "../../actions";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditStorePage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const store = await getStoreById(id);

  if (!store) notFound();

  const boundAction = updateStore.bind(null, id);

  return (
    <div>
      <AdminTopbar title={`تعديل: ${store.name_ar}`} />
      <div className="p-6 max-w-2xl space-y-4">
        {sp.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-700 text-sm">حدث خطأ أثناء الحفظ. تأكد من عدم تكرار الـ slug وحاول مجدداً.</p>
          </div>
        )}
        <StoreForm store={store} action={boundAction} submitLabel="حفظ التغييرات" />
      </div>
    </div>
  );
}
