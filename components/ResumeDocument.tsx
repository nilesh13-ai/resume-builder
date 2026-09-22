import type { ResumeData, TemplateId } from "@/lib/types";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";

/** Renders the selected template. Used by both the on-screen preview and the print output. */
export function ResumeDocument({
  data,
  template,
}: {
  data: ResumeData;
  template: TemplateId;
}) {
  switch (template) {
    case "modern":
      return <ModernTemplate data={data} />;
    case "minimal":
      return <MinimalTemplate data={data} />;
    default:
      return <ClassicTemplate data={data} />;
  }
}
