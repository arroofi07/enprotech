import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  /** Square gear mark for compact slots (sidebar icon, favicon-style). */
  mark?: boolean;
  priority?: boolean;
};

export function BrandLogo({
  className,
  mark = false,
  priority,
}: BrandLogoProps) {
  if (mark) {
    return (
      <Image
        src="/logo.png"
        alt="Enprotech"
        width={40}
        height={40}
        className={cn("size-10 object-contain", className)}
        priority={priority}
      />
    );
  }

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
