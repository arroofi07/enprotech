"use client";

import { ModuleCreateForm } from "@/components/modules/module-create-form";
import { ModuleEditCard } from "@/components/modules/module-edit-card";
import { ModuleSortableList } from "@/components/modules/module-sortable-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ModuleWithContents } from "@/lib/infrastructure/db/repositories/module-repository";

type ModuleManagementPanelProps = {
  trainingId: string;
  modules: ModuleWithContents[];
};

export function ModuleManagementPanel({
  trainingId,
  modules,
}: ModuleManagementPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buat Modul Baru</CardTitle>
          <CardDescription>
            Tambahkan modul pembelajaran dengan judul dan deskripsi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModuleCreateForm trainingId={trainingId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Modul</CardTitle>
          <CardDescription>
            Atur urutan modul dengan drag & drop, lalu kelola konten tiap modul.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Belum ada modul. Buat modul pertama di atas.
            </p>
          ) : (
            <ModuleSortableList
              modules={modules}
              trainingId={trainingId}
              renderModule={(module) => (
                <ModuleEditCard module={module} trainingId={trainingId} />
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
