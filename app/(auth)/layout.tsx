import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { BrandLogo } from "@/components/brand/brand-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.458_0.209_330_/_0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,oklch(0.72_0.17_330_/_0.1),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:32px_32px]"
      />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_24px_80px_-24px_oklch(0.32_0.13_330_/_0.45)] lg:min-h-152 lg:grid-cols-2">
        <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 space-y-2">
              <BrandLogo priority className="h-11" />
              <p className="text-sm text-muted-foreground">
                Platform pembelajaran dan pelatihan Enprotech
              </p>
            </div>
            {children}
          </div>
        </div>
        <AuthBrandPanel />
      </div>
    </div>
  );
}
