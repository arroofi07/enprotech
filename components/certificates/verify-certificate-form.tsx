"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VerifyCertificateForm({
  initialNumber = "",
}: {
  initialNumber?: string;
}) {
  const router = useRouter();
  const [certificateNumber, setCertificateNumber] = useState(initialNumber);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = certificateNumber.trim();
    if (!trimmed) {
      return;
    }

    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="certificateNumber">Nomor Sertifikat</Label>
        <Input
          id="certificateNumber"
          name="certificateNumber"
          placeholder="CERT-TRAINING-2026-0001"
          value={certificateNumber}
          onChange={(event) => setCertificateNumber(event.target.value)}
          className="h-10"
        />
      </div>
      <Button type="submit" className="w-full">
        Verifikasi
      </Button>
    </form>
  );
}
