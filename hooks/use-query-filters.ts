"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

type NavigateWithFormDataOptions = {
  /** Override current pathname when building the URL. */
  pathname?: string;
  /** Drop `page` so filtered results start from page 1. Defaults to true. */
  resetPage?: boolean;
};

export function useQueryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function navigateWithFormData(
    formData: FormData,
    options: NavigateWithFormDataOptions = {},
  ) {
    const targetPath = options.pathname ?? pathname;
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (typeof value !== "string") {
        continue;
      }

      const trimmed = value.trim();
      if (trimmed) {
        params.set(key, trimmed);
      }
    }

    if (options.resetPage !== false) {
      params.delete("page");
    }

    const query = params.toString();
    const href = query ? `${targetPath}?${query}` : targetPath;

    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  function onFilterSubmit(
    event: React.FormEvent<HTMLFormElement>,
    options?: NavigateWithFormDataOptions,
  ) {
    event.preventDefault();
    navigateWithFormData(new FormData(event.currentTarget), options);
  }

  return {
    isPending,
    navigateWithFormData,
    onFilterSubmit,
    pathname,
  };
}
