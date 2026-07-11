import { Skeleton } from "@/components/ui/skeleton";

export default function VerifyLoading() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8">
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto size-12 rounded-full" />
          <Skeleton className="mx-auto h-7 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}
