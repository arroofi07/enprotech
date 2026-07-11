"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  DashboardPageSkeleton,
  type DashboardSkeletonVariant,
} from "@/components/loading/dashboard-page-skeleton";

type DashboardNavigationLoadingProps = {
  children: React.ReactNode;
  variant?: DashboardSkeletonVariant;
};

function isModifiedClick(event: MouseEvent) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function resolveInternalHref(anchor: HTMLAnchorElement): URL | null {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) {
    return null;
  }
  if (anchor.hasAttribute("download")) {
    return null;
  }
  if (anchor.target && anchor.target !== "_self") {
    return null;
  }

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) {
      return null;
    }
    if (url.pathname.startsWith("/api")) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export function DashboardNavigationLoading({
  children,
  variant = "table",
}: DashboardNavigationLoadingProps) {
  const pathname = usePathname();
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const pending = Boolean(targetPath && targetPath !== pathname);

  useEffect(() => {
    if (!pending) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setTargetPath(null);
    }, 8_000);

    return () => window.clearTimeout(timeout);
  }, [pending]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const url = resolveInternalHref(anchor);
      if (!url) {
        return;
      }

      // Same-path query changes (search/pagination) should not replace the page with a skeleton.
      if (url.pathname === window.location.pathname) {
        return;
      }

      setTargetPath(url.pathname);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (pending) {
    return <DashboardPageSkeleton variant={variant} />;
  }

  return children;
}
