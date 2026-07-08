import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getDashboardPath } from "@/lib/domain/auth/permissions";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDashboardPath(user.role));
  }

  redirect("/login");
}
