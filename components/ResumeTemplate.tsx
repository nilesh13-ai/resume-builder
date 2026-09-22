import { memo } from "react";
import type { ResumeData, TemplateId } from "@/lib/types";
import { getTemplate } from "./templates";

/**
 * Renders `data` with the chosen template. Used by previews, thumbnails, and
 * print output. Memoized so wrapper re-renders (e.g. the preview measuring its
 * own size) don't re-render the template DOM when the data hasn't changed.
 */
export const ResumeTemplate = memo(function ResumeTemplate({
  data,
  templateId,
}: {
  data: ResumeData;
  templateId: TemplateId;
}) {
  const { Component } = getTemplate(templateId);
  return <Component data={data} />;
});
