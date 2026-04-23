import Link from "next/link";
import { AdminTopbar } from "@/components/admin/topbar";
import { getContactMessages } from "@/lib/queries/admin";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminInboxPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { messages, total, perPage } = await getContactMessages(page);
  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <AdminTopbar title="رسائل التواصل" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-warm-brown">
            إجمالي الرسائل:{" "}
            <span className="font-bold text-charcoal">
              {total.toLocaleString("ar-EG")}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-charcoal/8 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal/8 text-warm-brown text-xs">
                <th className="text-right px-4 py-3 font-medium">المُرسِل</th>
                <th className="text-right px-4 py-3 font-medium">الموضوع</th>
                <th className="text-right px-4 py-3 font-medium">الرسالة</th>
                <th className="text-right px-4 py-3 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-charcoal/5 last:border-0 hover:bg-cream/60 transition-colors align-top"
                >
                  <td className="px-4 py-3 text-charcoal font-medium whitespace-nowrap">
                    {m.name ?? <span className="text-warm-brown/40">—</span>}
                  </td>
                  <td className="px-4 py-3 text-charcoal max-w-[180px]">
                    <span className="truncate block">{m.subject}</span>
                  </td>
                  <td className="px-4 py-3 text-warm-brown/80 max-w-[320px]">
                    <span className="line-clamp-2 text-xs">{m.message}</span>
                  </td>
                  <td
                    className="px-4 py-3 text-warm-brown/50 text-xs whitespace-nowrap"
                    dir="ltr"
                  >
                    {formatDistanceToNow(new Date(m.created_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-warm-brown/40"
                  >
                    لا توجد رسائل بعد
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
                href={`/admin/inbox?page=${page - 1}`}
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
                href={`/admin/inbox?page=${page + 1}`}
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
