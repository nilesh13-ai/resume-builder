import type { ResumeData, TemplateId } from "@/lib/types";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";

/** Renders the selected template. Used by both the on-screen preview and the print output. */
export function ResumeDocument({
  data,
  template,
}: {
  data: ResumeData;
  template: TemplateId;
}) {
  return template === "modern" ? (
    <ModernTemplate data={data} />
  ) : (
    <ClassicTemplate data={data} />
  );
}
