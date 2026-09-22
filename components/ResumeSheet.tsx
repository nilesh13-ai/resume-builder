"use client";

import { useEffect, useRef, useState } from "react";
import type { ResumeData, TemplateId } from "@/lib/types";
import { ResumeTemplate } from "./ResumeTemplate";

const A4_RATIO = 297 / 210;

/**
 * An A4 sheet (210mm wide, 14mm padding, matching the print @page margins)
 * scaled down to fit its container's width. With `fixedAspect`, the wrapper is
 * clipped to one page's proportions, which suits thumbnails.
 *
 * Until the first measurement the sheet is kept invisible and, for thumbnails,
 * the wrapper reserves the page's aspect ratio, so nothing shifts on load.
 */
export function ResumeSheet({
  data,
  templateId,
  fixedAspect = false,
  className = "",
}: {
  data: ResumeData;
  templateId: TemplateId;
  fixedAspect?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ scale: number; height: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const sheet = sheetRef.current;
    if (!container || !sheet) return;

    const update = () => {
      const containerWidth = container.clientWidth;
      const sheetWidth = sheet.offsetWidth; // unaffected by transform
      if (containerWidth === 0 || sheetWidth === 0) return;
      const scale = Math.min(1, containerWidth / sheetWidth);
      const height = (fixedAspect ? sheetWidth * A4_RATIO : sheet.offsetHeight) * scale;
      setLayout((prev) => (prev && prev.scale === scale && prev.height === height ? prev : { scale, height }));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [fixedAspect]);

  return (
    <div
      ref={containerRef}
      className={`w-full min-w-0 contain-inline-size ${fixedAspect ? "pointer-events-none select-none overflow-hidden" : ""} ${className}`}
      style={layout ? { height: layout.height } : fixedAspect ? { aspectRatio: `210 / 297` } : undefined}
    >
      <div
        ref={sheetRef}
        className="w-[210mm] min-h-[297mm] bg-white p-[14mm] text-black shadow-lg ring-1 ring-zinc-200"
        style={{
          transform: `scale(${layout?.scale ?? 1})`,
          transformOrigin: "top left",
          visibility: layout ? "visible" : "hidden",
        }}
      >
        <ResumeTemplate data={data} templateId={templateId} />
      </div>
    </div>
  );
}
