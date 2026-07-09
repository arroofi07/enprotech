import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProgressStatCardProps = {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  highlight?: boolean;
  className?: string;
};

export function ProgressStatCard({
  title,
  value,
  description,
  icon,
  highlight = false,
  className,
}: ProgressStatCardProps) {
  return (
    <Card className={cn(highlight && "border-primary/40 bg-primary/5", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl">{value}</CardTitle>
        </div>
        {icon ? (
          <div className="rounded-md bg-muted p-2 text-muted-foreground">
            {icon}
          </div>
        ) : null}
      </CardHeader>
      {description ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
