"use client";

import { DashboardError } from "@/components/error/dashboard-error";

export default function StudentError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <DashboardError {...props} dashboardHref="/student/dashboard" />;
}
