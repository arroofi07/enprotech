import type { ReactNode } from "react";

type DashboardMainProps = {
  children: ReactNode;
};

export function DashboardMain({ children }: DashboardMainProps) {
  return (
    <main className="relative flex-1 overflow-auto">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.458_0.209_330_/_0.07),transparent_45%)]"
      />
      <div className="relative container max-w-7xl min-w-0 space-y-8 p-4 sm:p-6 md:p-8">
        {children}
      </div>
    </main>
  );
}
