import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export type DashboardSkeletonVariant = "table" | "stats" | "content" | "grid";

type DashboardPageSkeletonProps = {
  variant?: DashboardSkeletonVariant;
};

function DashboardHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Skeleton className="size-8 rounded-md" />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="size-3 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="ml-auto">
        <Skeleton className="size-9 rounded-md" />
      </div>
    </header>
  );
}

function PageHeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      {withAction ? <Skeleton className="h-10 w-36 shrink-0 rounded-md" /> : null}
    </div>
  );
}

function TableContentSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-full rounded-md sm:w-40" />
        </div>
        <Skeleton className="h-4 w-48" />
        <div className="space-y-3">
          <div className="flex gap-4 border-b pb-3">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-1">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="size-9 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsContentSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-9 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-44" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ContentCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <div className="space-y-4 pt-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </CardContent>
    </Card>
  );
}

function GridContentSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-9 w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DashboardPageSkeleton({
  variant = "table",
}: DashboardPageSkeletonProps) {
  return (
    <>
      <DashboardHeaderSkeleton />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <PageHeaderSkeleton withAction={variant === "stats"} />
          {variant === "table" ? <TableContentSkeleton /> : null}
          {variant === "stats" ? <StatsContentSkeleton /> : null}
          {variant === "content" ? <ContentCardSkeleton /> : null}
          {variant === "grid" ? <GridContentSkeleton /> : null}
        </div>
      </main>
    </>
  );
}
