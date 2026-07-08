import { logoutAction } from "@/app/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SessionUser } from "@/lib/domain/auth/types";

type DashboardShellProps = {
  user: SessionUser;
  title: string;
  description: string;
};

export function DashboardShell({
  user,
  title,
  description,
}: DashboardShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="secondary" className="capitalize">
            {user.role}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>

          <form action={logoutAction}>
            <Button type="submit" variant="outline">
              Keluar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
