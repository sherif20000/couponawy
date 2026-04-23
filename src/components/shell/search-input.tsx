"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchInput() {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut: "/" to focus (when not already in an input)
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="border-brand-gold/30 bg-cream-dark/40 hidden items-center gap-2 rounded-full border px-4 py-2 focus-within:border-brand-red/50 focus-within:bg-cream transition-colors md:flex"
    >
      <Search className="text-warm-brown-light h-4 w-4 shrink-0" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ابحث عن متجر أو كوبون..."
        className="font-body text-charcoal placeholder:text-warm-brown-light w-56 bg-transparent text-sm outline-none"
        aria-label="بحث"
      />
    </form>
  );
}
