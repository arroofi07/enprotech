import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { TrainingsPagination } from "@/components/trainings/trainings-pagination";
import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listTrainings } from "@/lib/application/trainings/list-trainings";

type TrainerModulesHubPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

export default async function TrainerModulesHubPage({
  searchParams,
}: TrainerModulesHubPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const result = await listTrainings(user, {
    search: params.search,
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
      <TrainerHeader
        title="Modul"
        breadcrumbs={[{ label: "Modul" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Kelola Modul"
            description="Pilih training untuk mengatur modul, materi, dan video conference."
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {items.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    training
                  </p>
                </div>

                {items.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed py-16 text-center text-sm text-muted-foreground">
                    Belum ada training. Buat training terlebih dahulu.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead>Training</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((training) => (
                          <TableRow key={training.id}>
                            <TableCell className="font-medium">
                              {training.title}
                            </TableCell>
                            <TableCell>
                              <TrainingStatusBadge status={training.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <ButtonLink
                                variant="outline"
                                size="sm"
                                href={`/trainer/trainings/${training.id}/modules`}
                              >
                                Kelola Modul
                              </ButtonLink>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <TrainingsPagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/trainer/modules"
                  searchParams={{
                    search: params.search,
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
