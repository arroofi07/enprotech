import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className, priority }: BrandLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Enprotech"
      width={160}
      height={103}
      className={cn("h-8 w-auto object-contain", className)}
      priority={priority}
    />
  );
}
