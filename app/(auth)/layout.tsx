export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold tracking-tight">E-Training Enprotech</h1>
          <p className="text-xs text-muted-foreground">
            Platform pembelajaran dan pelatihan internal
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
