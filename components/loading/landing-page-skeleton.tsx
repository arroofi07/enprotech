import { Skeleton } from "@/components/ui/skeleton";

export function LandingPageSkeleton() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="hidden h-9 w-20 rounded-md sm:block" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container space-y-6 px-4 py-16 md:px-6 md:py-24">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-5 w-full max-w-lg" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-36 rounded-md" />
            <Skeleton className="h-11 w-36 rounded-md" />
          </div>
        </section>
        <section className="border-t bg-muted/30 py-16">
          <div className="container grid gap-6 px-4 md:grid-cols-3 md:px-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
