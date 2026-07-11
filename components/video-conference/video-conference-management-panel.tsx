import { VideoConferenceModuleForm } from "@/components/video-conference/video-conference-module-form";
import type { ModuleWithContents } from "@/lib/infrastructure/db/repositories/module-repository";

type VideoConferenceManagementPanelProps = {
  trainingId: string;
  trainingTitle: string;
  modules: ModuleWithContents[];
};

export function VideoConferenceManagementPanel({
  trainingId,
  trainingTitle,
  modules,
}: VideoConferenceManagementPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Training:{" "}
          <span className="font-medium text-foreground">{trainingTitle}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih modul, isi link Meet/Zoom, lalu tentukan jadwal video
          conference.
        </p>
      </div>

      {modules.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Belum ada modul. Buat modul terlebih dahulu di halaman Kelola Modul.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {modules.map((module) => (
            <VideoConferenceModuleForm
              key={module.id}
              trainingId={trainingId}
              module={module}
            />
          ))}
        </div>
      )}
    </div>
  );
}
