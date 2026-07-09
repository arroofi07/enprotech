import type { SessionUser } from "@/lib/domain/auth/types";
import { validateUploadFile } from "@/lib/domain/modules/file-validation";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import type { UploadPurpose } from "@/lib/domain/modules/types";
import { uploadFileToBlob } from "@/lib/infrastructure/storage/blob-storage";
import { uploadFileSchema } from "@/lib/validations/module-schemas";

import { assertModuleTrainerOrAdmin } from "./assert-access";

export type UploadFileResult = {
  url: string;
  size: number;
  purpose: UploadPurpose;
};

export async function uploadModuleFile(
  actor: SessionUser | null,
  input: unknown,
  file: File | null,
): Promise<ModuleResult<UploadFileResult>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = uploadFileSchema.safeParse(input);
  if (!parsed.success || !file) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const validation = validateUploadFile(parsed.data.purpose, {
    type: file.type,
    size: file.size,
    name: file.name,
  });

  if (!validation.valid) {
    return moduleFailure(
      validation.error === "INVALID_FILE_TYPE"
        ? ModuleErrorCode.INVALID_FILE_TYPE
        : ModuleErrorCode.FILE_TOO_LARGE,
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadFileToBlob({
      filename: file.name,
      contentType: file.type,
      data: buffer,
      purpose: parsed.data.purpose,
    });

    return moduleSuccess({
      url: uploaded.url,
      size: uploaded.size,
      purpose: parsed.data.purpose,
    });
  } catch {
    return moduleFailure(ModuleErrorCode.UPLOAD_FAILED);
  }
}
