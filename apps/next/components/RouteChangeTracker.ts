"use client";

import { useTracker } from "@codedazur/react-tracking";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function RouteChangeTracker() {
  const pathname = usePathname();
  const { trackNavigate } = useTracker();

  useEffect(() => {
    void trackNavigate({
      path: pathname,
      title: document.title,
    });
  }, [pathname, trackNavigate]);

  return null;
}
