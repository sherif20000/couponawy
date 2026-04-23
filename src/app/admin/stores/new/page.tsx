import { AdminTopbar } from "@/components/admin/topbar";
import { StoreForm } from "@/components/admin/store-form";
import { createStore } from "../actions";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewStorePage({ searchParams }: Props) {
  const sp = await searchParams;

  return (
    <div>
      <AdminTopbar title="متجر جديد" />
      <div className="p-6 max-w-2xl space-y-4">
        {sp.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-700 text-sm">حدث خطأ أثناء الإنشاء. تأكد من عدم تكرار الـ slug وحاول مجدداً.</p>
          </div>
        )}
        <StoreForm action={createStore} submitLabel="إنشاء المتجر" />
      </div>
    </div>
  );
}
