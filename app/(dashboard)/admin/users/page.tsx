import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UsersFilters } from "@/components/users/users-filters";
import { UsersPagination } from "@/components/users/users-pagination";
import { UsersTable } from "@/components/users/users-table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listUsers } from "@/lib/application/users/list-users";

type AdminUsersPageProps = {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const result = await listUsers(user, {
    search: params.search,
    role: params.role,
    status: params.status,
    page: params.page,
    pageSize: 10,
  });

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items, page, totalPages, total } = result.data;

  return (
    <>
      <AdminHeader
        title="Pengguna"
        breadcrumbs={[{ label: "Pengguna" }]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl min-w-0 space-y-6 p-4 sm:p-6 md:p-8">
          <AdminPageHeader
            title="Manajemen Pengguna"
            description="Approve, ubah role, dan aktifkan/nonaktifkan akun pengguna."
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <UsersFilters
                  search={params.search}
                  role={params.role}
                  status={params.status}
                />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan <span className="font-medium text-foreground">{items.length}</span> dari{" "}
                    <span className="font-medium text-foreground">{total}</span> pengguna
                  </p>
                </div>

                <UsersTable users={items} currentUserId={user.id} />

                <UsersPagination
                  page={page}
                  totalPages={totalPages}
                  searchParams={{
                    search: params.search,
                    role: params.role,
                    status: params.status,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
