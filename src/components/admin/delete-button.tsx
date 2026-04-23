"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  action: () => Promise<void>;
  confirmMessage?: string;
}

/**
 * Client component that calls a server action after the user confirms.
 * Pass an inline server action (`async () => { "use server"; ... }`) as `action`.
 */
export function DeleteButton({
  action,
  confirmMessage = "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.",
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    startTransition(() => action());
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="p-1.5 rounded-lg text-warm-brown hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      aria-label="حذف"
    >
      <Trash2 size={14} />
    </button>
  );
}
