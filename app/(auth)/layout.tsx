import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-linear-to-br from-muted via-background to-accent/40 p-4 sm:p-6 lg:p-8">
      <Card className="grid w-full max-w-5xl gap-0 overflow-hidden rounded-3xl py-0 shadow-2xl ring-0 lg:min-h-152 lg:grid-cols-2">
        <CardContent className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 space-y-2">
              <Badge variant="outline" className="text-xs font-medium">
                E-Training Enprotech
              </Badge>
              <CardDescription className="text-sm">
                Platform pembelajaran dan pelatihan internal
              </CardDescription>
            </div>
            {children}
          </div>
        </CardContent>
        <AuthBrandPanel />
      </Card>
    </div>
  );
}
