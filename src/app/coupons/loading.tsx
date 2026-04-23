import { Container } from "@/components/ui/container";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-warm-brown/10 ${className}`} />
  );
}

export default function CouponsLoading() {
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

      {/* Filters + grid skeleton */}
      <section className="py-12 md:py-16">
        <Container size="xl">
          {/* Filter bar */}
          <div className="mb-8 flex flex-wrap items-center gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>

          {/* Coupon card grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-warm-brown/8 bg-cream-dark p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-9 w-full rounded-lg mt-1" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
