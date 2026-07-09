import type { SessionUser } from "@/lib/domain/auth/types";
import type { ModuleContentType } from "@/lib/domain/modules/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import {
  createModule as createModuleInRepo,
  findTrainingByIdForModule,
  type ModuleRecord,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { createModuleSchema } from "@/lib/validations/module-schemas";

import { assertModuleTrainerOrAdmin } from "./assert-access";

function buildInitialContents(input: {
  title: string;
  materialUrl?: string;
  materialSize?: number;
  videoUrl?: string;
  pptUrl?: string;
}): Array<{
  type: ModuleContentType;
  title: string;
  url: string;
  fileSize?: number;
}> {
  const contents: Array<{
    type: ModuleContentType;
    title: string;
    url: string;
    fileSize?: number;
  }> = [];

  if (input.materialUrl) {
    contents.push({
      type: "document",
      title: `Materi ${input.title}`,
      url: input.materialUrl,
      fileSize: input.materialSize,
    });
  }

  if (input.videoUrl) {
    contents.push({
      type: "video_link",
      title: "Video Materi",
      url: input.videoUrl,
    });
  }

  if (input.pptUrl) {
    contents.push({
      type: "download_link",
      title: "Presentasi PPT",
      url: input.pptUrl,
    });
  }

  return contents;
}

export async function createModule(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<ModuleRecord>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = createModuleSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const training = await findTrainingByIdForModule(parsed.data.trainingId);
  if (!training) {
    return moduleFailure(ModuleErrorCode.TRAINING_NOT_FOUND);
  }

  const {
    videoUrl,
    pptUrl,
    materialUrl,
    materialSize,
    order,
    ...moduleInput
  } = parsed.data;

  const contents = buildInitialContents({
    title: moduleInput.title,
    materialUrl,
    materialSize,
    videoUrl,
    pptUrl,
  });

  const module = await createModuleInRepo({
    ...moduleInput,
    order: order !== undefined ? order - 1 : undefined,
    contents,
  });
  return moduleSuccess(module);
}
