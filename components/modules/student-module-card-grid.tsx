import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StudentModuleCardGridProps = {
  children: ReactNode;
  className?: string;
};

export function StudentModuleCardGrid({
  children,
  className,
}: StudentModuleCardGridProps) {
  return (
    <div
      className={cn(
        "grid w-full gap-4 sm:gap-6 grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))]",
        className,
      )}
    >
      {children}
    </div>
  );
}
