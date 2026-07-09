import { ModulesTable } from "@/components/modules/modules-table";
import type { ModuleWithContents } from "@/lib/infrastructure/db/repositories/module-repository";

type ModulesProgressRequirementsProps = {
  modules: ModuleWithContents[];
  onManage: (module: ModuleWithContents) => void;
};

export function ModulesProgressRequirements({
  modules,
  onManage,
}: ModulesProgressRequirementsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Syarat Lanjut Modul</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tentukan syarat peserta untuk lanjut dari satu modul ke modul
          berikutnya.
        </p>
      </div>

      <ModulesTable
        modules={modules}
        onManage={onManage}
        showProgressRequirements
      />
    </div>
  );
}
