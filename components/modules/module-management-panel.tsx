"use client";

import { useState } from "react";
import { IconArrowsSort, IconPlus } from "@tabler/icons-react";

import { ModuleCreateForm } from "@/components/modules/module-create-form";
import { ModuleEditCard } from "@/components/modules/module-edit-card";
import { ModulesFilters } from "@/components/modules/modules-filters";
import { ModulesPagination } from "@/components/modules/modules-pagination";
import { ModuleSortableList } from "@/components/modules/module-sortable-list";
import { ModulesTable } from "@/components/modules/modules-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ModuleWithContents } from "@/lib/infrastructure/db/repositories/module-repository";

type ModuleManagementPanelProps = {
  trainingId: string;
  modules: ModuleWithContents[];
  allModules: ModuleWithContents[];
  page: number;
  totalPages: number;
  total: number;
  search?: string;
};

export function ModuleManagementPanel({
  trainingId,
  modules,
  allModules,
  page,
  totalPages,
  total,
  search,
}: ModuleManagementPanelProps) {
  const [selectedModule, setSelectedModule] = useState<ModuleWithContents | null>(
    null,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Total{" "}
            <span className="font-medium text-foreground">{total}</span> modul
            {search ? (
              <>
                {" "}
                untuk pencarian &quot;{search}&quot;
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={reorderOpen} onOpenChange={setReorderOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" disabled={allModules.length < 2} />
              }
            >
              <IconArrowsSort className="size-4" />
              Atur Urutan
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Atur Urutan Modul</DialogTitle>
                <DialogDescription>
                  Seret modul untuk mengubah urutan pembelajaran.
                </DialogDescription>
              </DialogHeader>
              {allModules.length > 0 ? (
                <ModuleSortableList
                  modules={allModules}
                  trainingId={trainingId}
                  renderModule={(module) => (
                    <div className="py-3 pr-4">
                      <p className="font-medium">{module.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {module.contents.length} konten
                      </p>
                    </div>
                  )}
                />
              ) : null}
            </DialogContent>
          </Dialog>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button />}>
              <IconPlus className="size-4" />
              Buat Modul
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Buat Modul Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan modul pembelajaran dengan judul dan deskripsi.
                </DialogDescription>
              </DialogHeader>
              <ModuleCreateForm trainingId={trainingId} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ModulesFilters search={search} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan{" "}
          <span className="font-medium text-foreground">{modules.length}</span>{" "}
          dari <span className="font-medium text-foreground">{total}</span>{" "}
          modul
        </p>
      </div>

      <ModulesTable modules={modules} onManage={setSelectedModule} />

      <ModulesPagination
        trainingId={trainingId}
        page={page}
        totalPages={totalPages}
        searchParams={{ search }}
      />

      <Sheet
        open={selectedModule !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedModule(null);
          }
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          {selectedModule ? (
            <>
              <SheetHeader className="border-b pb-4">
                <SheetTitle>{selectedModule.title}</SheetTitle>
                <SheetDescription>
                  Edit detail modul, upload materi, dan kelola konten.
                </SheetDescription>
              </SheetHeader>
              <div className="p-6">
                <ModuleEditCard
                  module={selectedModule}
                  trainingId={trainingId}
                />
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
