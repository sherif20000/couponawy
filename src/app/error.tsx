"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center py-24">
      <Container size="sm" className="text-center">
        <p className="font-accent text-brand-red mb-4 text-5xl">خطأ</p>
        <h1 className="font-display text-charcoal mb-3 text-2xl font-extrabold">
          حدث خطأ غير متوقع
        </h1>
        <p className="font-body text-warm-brown mb-8 text-base leading-relaxed">
          نعتذر عن هذا الإزعاج. جرّب تحديث الصفحة، أو عُد إلى الرئيسية.
        </p>
        {error.digest && (
          <p className="font-mono text-warm-brown/40 mb-6 text-xs" dir="ltr">
            {error.digest}
          </p>
        )}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="font-body inline-flex h-10 items-center justify-center rounded-full bg-brand-red px-6 text-sm font-semibold text-cream transition-all hover:bg-brand-red-dark active:scale-[0.98]"
          >
            حاول مرة أخرى
          </button>
          <Link
            href="/"
            className="font-body inline-flex h-10 items-center rounded-full border border-brand-gold/30 px-6 text-sm font-semibold text-charcoal transition-all hover:bg-cream-dark/40 active:scale-[0.98]"
          >
            الرئيسية
          </Link>
        </div>
      </Container>
    </main>
  );
}
