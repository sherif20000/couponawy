import { Section } from "@/components/shell/section";

export default function GuidesLoading() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-brand-red py-10 md:py-14" aria-hidden>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white/15 mb-4 h-3 w-32 rounded" />
          <div className="bg-white/25 h-8 w-56 rounded md:h-10 md:w-72" />
          <div className="bg-white/15 mt-3 h-4 w-72 rounded" />
        </div>
      </section>

      <Section spacing="lg">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-cream-dark/30 border-brand-gold/15 animate-pulse rounded-2xl border"
            >
              <div className="bg-cream-dark/50 aspect-[16/10] w-full rounded-t-2xl" />
              <div className="space-y-3 p-5">
                <div className="bg-cream-dark/60 h-3 w-16 rounded-full" />
                <div className="bg-cream-dark/60 h-5 w-3/4 rounded" />
                <div className="bg-cream-dark/40 h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
