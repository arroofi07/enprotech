"use client";

import { IconStar, IconStarFilled } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

type RatingStarsProps = {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
};

const STAR_VALUES = [1, 2, 3, 4, 5];

const SIZE_CLASSNAME: Record<NonNullable<RatingStarsProps["size"]>, string> = {
  sm: "size-4",
  md: "size-6",
};

export function RatingStars({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: RatingStarsProps) {
  const starClassName = SIZE_CLASSNAME[size];

  return (
    <div className="flex items-center gap-1" role={readOnly ? undefined : "radiogroup"}>
      {STAR_VALUES.map((star) => {
        const filled = star <= value;

        if (readOnly) {
          return filled ? (
            <IconStarFilled
              key={star}
              className={cn(starClassName, "text-amber-500")}
            />
          ) : (
            <IconStar
              key={star}
              className={cn(starClassName, "text-muted-foreground/40")}
            />
          );
        }

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} bintang`}
            onClick={() => onChange?.(star)}
            className="rounded-sm outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {filled ? (
              <IconStarFilled className={cn(starClassName, "text-amber-500")} />
            ) : (
              <IconStar
                className={cn(starClassName, "text-muted-foreground/40")}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
