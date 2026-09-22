import type { ComponentType } from "react";
import { TEMPLATE_IDS, type ResumeData, type TemplateId } from "@/lib/types";
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

/** Adding a template: create its file, add its id to TEMPLATE_IDS in lib/types.ts, then add one entry here. */
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

// Compile-time check that every template id has a registry entry.
const registered: Record<TemplateId, true> = Object.fromEntries(TEMPLATES.map((t) => [t.id, true])) as Record<TemplateId, true>;
void registered;
if (TEMPLATES.length !== TEMPLATE_IDS.length) throw new Error("TEMPLATES and TEMPLATE_IDS are out of sync");

export function getTemplate(id: TemplateId): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
