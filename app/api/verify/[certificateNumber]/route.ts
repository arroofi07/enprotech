import { NextResponse } from "next/server";

import { verifyCertificate } from "@/lib/application/certificates/verify-certificate";
import { certificateErrorHttpStatus } from "@/lib/application/certificates/error-http-status";

type RouteContext = {
  params: Promise<{ certificateNumber: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { certificateNumber } = await context.params;
  const decodedNumber = decodeURIComponent(certificateNumber);

  const result = await verifyCertificate({
    certificateNumber: decodedNumber,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, message: result.message, isValid: false },
      { status: certificateErrorHttpStatus(result.error) },
    );
  }

  return NextResponse.json(result.data);
}
