import type { ComponentType } from "react";
import type { ResumeData, TemplateId } from "@/lib/types";
import { BoldTemplate } from "./BoldTemplate";
import { ClassicTemplate } from "./ClassicTemplate";
import { CompactTemplate } from "./CompactTemplate";
import { MinimalTemplate } from "./MinimalTemplate";
import { ModernTemplate } from "./ModernTemplate";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  Component: ComponentType<{ data: ResumeData }>;
}

/** Adding a template: create its file, then add one entry here. */
export const TEMPLATES: readonly TemplateMeta[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Single column, serif, black and white. Safe for any industry.",
    Component: ClassicTemplate,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Colored sidebar for contact and skills, clean sans-serif body.",
    Component: ModernTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Generous whitespace and thin lines. Lets the content speak.",
    Component: MinimalTemplate,
  },
  {
    id: "bold",
    name: "Bold",
    description: "Large name header with an accent color. Stands out in a stack.",
    Component: BoldTemplate,
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense two-column layout that fits a long career on one page.",
    Component: CompactTemplate,
  },
];

export const TEMPLATE_IDS: readonly TemplateId[] = TEMPLATES.map((t) => t.id);

export function getTemplate(id: TemplateId): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
