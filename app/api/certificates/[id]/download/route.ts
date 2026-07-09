import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { downloadCertificate } from "@/lib/application/certificates/download-certificate";
import { certificateErrorHttpStatus } from "@/lib/application/certificates/error-http-status";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const actor = await getCurrentUser();
  const { id } = await context.params;

  const result = await downloadCertificate(actor, { certificateId: id });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: certificateErrorHttpStatus(result.error) },
    );
  }

  const { buffer, contentType, filename } = result.data;

  return new NextResponse(Buffer.from(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
