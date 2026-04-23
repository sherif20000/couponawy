import Link from "next/link";
import { ArrowLeft, TagIcon } from "lucide-react";

type EmptyStateProps = {
  message: string;
  cta?: { href: string; label: string };
};

export function EmptyState({ message, cta }: EmptyStateProps) {
  return (
    <div className="border-brand-gold/30 bg-cream-dark/30 text-warm-brown font-body flex flex-col items-center gap-4 rounded-2xl border border-dashed p-12 text-center">
      {/* Decorative icon — warm, not clinical */}
      <span
        aria-hidden
        className="bg-brand-gold/10 text-brand-gold-dark flex h-12 w-12 items-center justify-center rounded-full"
      >
        <TagIcon className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <span>{message}</span>
      {cta && (
        <Link
          href={cta.href}
          className="font-body text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1 text-sm font-semibold transition-colors"
        >
          {cta.label}
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
