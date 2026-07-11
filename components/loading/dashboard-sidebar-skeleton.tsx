import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSidebarSkeleton() {
  return (
    <aside className="hidden h-svh w-(--sidebar-width) flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-6 px-4 py-2">
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            {Array.from({ length: 4 }).map((_, itemIndex) => (
              <Skeleton key={itemIndex} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ))}
      </div>
      <div className="space-y-3 border-t p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </aside>
  );
}
