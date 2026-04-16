"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AdSenseUnitProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle" | "fluid";
  className?: string;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdSenseUnit({
  slot,
  format = "auto",
  className,
  responsive = true,
}: AdSenseUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || isLoaded.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isLoaded.current = true;
    } catch {
      // AdSense não carregado ainda
    }
  }, [clientId]);

  if (!clientId) {
    // Placeholder em desenvolvimento
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-dashed border-dark-400 bg-dark-600/30 text-gray-700 text-xs font-mono",
          format === "horizontal" && "h-24",
          format === "vertical" && "h-96",
          format === "rectangle" && "h-64",
          format === "auto" && "h-24",
          className
        )}
      >
        AdSense · {slot} · {format}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
