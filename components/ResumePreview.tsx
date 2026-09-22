"use client";

import { useEffect, useRef, useState } from "react";
import type { ResumeData, TemplateId } from "@/lib/types";
import { ResumeDocument } from "./ResumeDocument";

/**
 * On-screen preview: an A4 sheet (210mm wide, 14mm padding, matching the
 * print @page margins) scaled down to fit its container.
 */
export function ResumePreview({
  data,
  template,
}: {
  data: ResumeData;
  template: TemplateId;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const container = containerRef.current;
    const sheet = sheetRef.current;
    if (!container || !sheet) return;

    const update = () => {
      const containerWidth = container.clientWidth;
      const sheetWidth = sheet.offsetWidth; // unaffected by transform
      if (containerWidth === 0 || sheetWidth === 0) return;
      const next = Math.min(1, containerWidth / sheetWidth);
      setScale(next);
      setHeight(sheet.offsetHeight * next);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      <div
        ref={sheetRef}
        className="w-[210mm] min-h-[297mm] bg-white p-[14mm] text-black shadow-lg ring-1 ring-zinc-200"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <ResumeDocument data={data} template={template} />
      </div>
    </div>
  );
}
