import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-linear-to-br from-muted via-background to-accent/40 p-4 sm:p-6 lg:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl lg:min-h-152 lg:grid-cols-2">
        <div className="flex flex-col justify-center p-8 text-card-foreground sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <span className="inline-flex items-center rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-foreground">
                E-Training Enprotech
              </span>
              <p className="mt-2 text-sm text-muted-foreground">
                Platform pembelajaran dan pelatihan internal
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
