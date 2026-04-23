import { Container } from "@/components/ui/container";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-warm-brown/10 ${className}`} />
  );
}

export default function HomeLoading() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero skeleton */}
      <section className="bg-gradient-to-b from-cream-dark/60 to-cream py-16 md:py-24">
        <Container size="lg">
          <div className="flex flex-col items-center gap-6 text-center">
            <Skeleton className="h-7 w-52 rounded-full" />
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-12 w-80" />
            <Skeleton className="h-16 w-full max-w-xl" />
            <div className="flex gap-3">
              <Skeleton className="h-11 w-36 rounded-full" />
              <Skeleton className="h-11 w-36 rounded-full" />
            </div>
          </div>
        </Container>
      </section>

      {/* Featured coupons skeleton */}
      <section className="py-16">
        <Container size="xl">
          <div className="mb-8 flex items-end justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
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

      {/* Stores skeleton */}
      <section className="bg-cream-dark/30 py-16">
        <Container size="xl">
          <div className="mb-8 flex items-end justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-14 w-14 rounded-full md:h-16 md:w-16" />
                <Skeleton className="h-3 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Categories skeleton */}
      <section className="py-16">
        <Container size="xl">
          <div className="mb-8">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full" />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
