import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ProjectErrorCode,
  projectFailure,
  projectSuccess,
  type ProjectResult,
} from "@/lib/domain/projects/errors";
import { validateProjectFile } from "@/lib/domain/projects/file-validation";
import type { ProjectFileKind } from "@/lib/domain/projects/types";
import { uploadFileToStorage } from "@/lib/infrastructure/storage/object-storage";
import { StorageConfigError } from "@/lib/infrastructure/storage/s3-client";
import { uploadProjectFileSchema } from "@/lib/validations/project-schemas";

import { assertProjectStudent } from "./assert-access";

export type UploadProjectFileResult = {
  url: string;
  size: number;
  kind: ProjectFileKind;
};

export async function uploadProjectFile(
  actor: SessionUser | null,
  input: unknown,
  file: File | null,
): Promise<ProjectResult<UploadProjectFileResult>> {
  const forbidden = assertProjectStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = uploadProjectFileSchema.safeParse(input);
  if (!parsed.success || !file) {
    return projectFailure(ProjectErrorCode.VALIDATION_ERROR);
  }

  const { kind } = parsed.data;
  const validation = validateProjectFile(kind, {
    type: file.type,
    size: file.size,
    name: file.name,
  });

  if (!validation.valid) {
    return projectFailure(
      validation.error === "INVALID_FILE_TYPE"
        ? ProjectErrorCode.INVALID_FILE_TYPE
        : ProjectErrorCode.FILE_TOO_LARGE,
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadFileToStorage({
      filename: file.name,
      contentType: file.type,
      data: buffer,
      purpose: kind === "image" ? "thumbnail" : "document",
      keyPrefix: "projects",
    });

    return projectSuccess({
      url: uploaded.url,
      size: uploaded.size,
      kind,
    });
  } catch (error) {
    if (error instanceof StorageConfigError) {
      console.error("[uploadProjectFile]", error.message);
      return {
        success: false,
        error: ProjectErrorCode.UPLOAD_FAILED,
        message: error.message,
      };
    }

    console.error("[uploadProjectFile]", error);
    return projectFailure(ProjectErrorCode.UPLOAD_FAILED);
  }
}
