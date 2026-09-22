import type { ResumeData, TemplateId } from "@/lib/types";
import { getTemplate } from "./templates";

/** Renders `data` with the chosen template. Used by previews, thumbnails, and print output. */
export function ResumeTemplate({ data, templateId }: { data: ResumeData; templateId: TemplateId }) {
  const { Component } = getTemplate(templateId);
  return <Component data={data} />;
}
