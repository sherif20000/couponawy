import { Container } from "@/components/ui/container";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-warm-brown/10 ${className}`} />
  );
}

export default function CategoriesLoading() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Page header skeleton */}
      <section className="from-cream-dark/60 to-cream border-brand-gold/20 border-b bg-gradient-to-b">
        <Container size="xl" className="py-10 md:py-14">
          <Skeleton className="mb-4 h-3 w-40 rounded-full" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-2 h-4 w-48" />
        </Container>
      </section>

      {/* Category grid skeleton */}
      <section className="py-12 md:py-16">
        <Container size="xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-warm-brown/8 bg-cream p-5 flex flex-col items-center gap-3"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
