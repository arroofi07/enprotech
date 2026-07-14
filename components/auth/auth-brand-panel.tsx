import Image from "next/image";
import {
  IconBook,
  IconCertificate,
  IconChartBar,
} from "@tabler/icons-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";

const valueProps = [
  {
    icon: IconBook,
    label: "Modul pelatihan terstruktur",
  },
  {
    icon: IconChartBar,
    label: "Pantau progres belajar",
  },
  {
    icon: IconCertificate,
    label: "Sertifikasi & evaluasi",
  },
] as const;

export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-linear-to-br from-primary via-primary to-sidebar p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between **:data-[slot=card-description]:text-primary-foreground/90 **:data-[slot=card-title]:text-primary-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary-foreground/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/3 size-48 -translate-y-1/2 rounded-full bg-primary-foreground/10 blur-3xl"
      />

      <div className="relative z-10">
        <BrandLogo priority className="h-14 drop-shadow-md" />
      </div>

      <div className="relative z-10 space-y-8">
        <div className="space-y-4">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Tingkatkan kompetensi lewat pelatihan internal.
          </CardTitle>
          <CardDescription className="max-w-md text-sm leading-relaxed text-primary-foreground/90">
            Platform terpadu untuk mengelola modul pelatihan, memantau progres
            peserta, dan menyelesaikan evaluasi serta sertifikasi.
          </CardDescription>
        </div>

        <ItemGroup className="gap-3">
          {valueProps.map(({ icon: Icon, label }) => (
            <Item
              key={label}
              className="border-transparent p-0 hover:bg-transparent"
            >
              <ItemMedia
                variant="icon"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 text-primary-foreground backdrop-blur"
              >
                <Icon className="size-4" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="text-sm font-medium text-primary-foreground">
                  {label}
                </ItemTitle>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </div>

      <div className="relative z-10 my-4 flex justify-center">
        <Card className="w-full max-w-[380px] overflow-hidden rounded-2xl border-primary-foreground/15 bg-primary-foreground/5 py-0 shadow-2xl ring-primary-foreground/15 backdrop-blur-xs">
          <AspectRatio ratio={4 / 3}>
            <Image
              src="/auth-illustration.png"
              alt="Ilustrasi Mahasiswa Belajar"
              fill
              className="object-cover"
              priority
            />
          </AspectRatio>
        </Card>
      </div>

      <div className="relative z-10 flex gap-4">
        <Card className="flex-1 rounded-2xl border-primary-foreground/25 bg-primary-foreground/12 py-4 ring-primary-foreground/25 backdrop-blur">
          <CardContent className="p-0 px-4">
            <CardDescription className="text-xs font-medium text-primary-foreground/90">
              Progres belajar
            </CardDescription>
            <CardTitle className="mt-1 text-2xl font-bold">78%</CardTitle>
            <Progress
              value={78}
              className="mt-3 w-full gap-0 **:data-[slot=progress-indicator]:rounded-full **:data-[slot=progress-indicator]:bg-primary-foreground **:data-[slot=progress-track]:h-1.5 **:data-[slot=progress-track]:rounded-full **:data-[slot=progress-track]:bg-primary-foreground/20"
            />
          </CardContent>
        </Card>

        <Card className="flex-1 rounded-2xl border-primary-foreground/25 bg-primary-foreground/12 py-4 ring-primary-foreground/25 backdrop-blur">
          <CardContent className="p-0 px-4">
            <CardDescription className="text-xs font-medium text-primary-foreground/90">
              Modul selesai
            </CardDescription>
            <CardTitle className="mt-1 text-2xl font-bold">12</CardTitle>
            <CardDescription className="mt-2 text-xs text-primary-foreground/80">
              dari 16 modul aktif
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
