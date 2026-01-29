import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { getLabelChecklist } from "@/lib/checklists";
import { cn } from "@/lib/utils";

type LabelChecklistProps = {
  productType?: string | null;
  sourceType?: string | null;
  className?: string;
};

const REQUIREMENT_STYLES: Record<
  "required" | "conditional",
  { label: string; variant: ComponentProps<typeof Badge>["variant"] }
> = {
  required: { label: "Required", variant: "treasury-secondary" },
  conditional: { label: "Conditional", variant: "treasury-accent" },
};

export function LabelChecklist({
  productType,
  sourceType,
  className,
}: LabelChecklistProps) {
  const checklist = getLabelChecklist(productType, sourceType);

  if (!checklist) {
    return (
      <div className={cn("border bg-card shadow-sm p-6", className)}>
        <h3 className="text-base font-semibold text-treasury-base-darkest">
          TTB Label Checklist
        </h3>
        <p className="mt-2 text-sm text-treasury-base-dark">
          Checklist unavailable for this product type.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("border bg-card shadow-sm p-6", className)}>
      <div>
        <h3 className="text-base font-semibold text-treasury-base-darkest">
          {checklist.title}
        </h3>
        <p className="mt-1 text-sm text-treasury-base-dark">
          {checklist.summary}
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {checklist.sections.map((section) => (
          <div key={section.title}>
            <h4 className="text-sm font-semibold text-treasury-base-darkest">
              {section.title}
            </h4>
            <ul className="mt-2 space-y-2">
              {section.items.map((item) => {
                const config = REQUIREMENT_STYLES[item.requirement];
                return (
                  <li
                    key={item.label}
                    className="flex items-start gap-3 text-sm text-treasury-base-dark"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-treasury-base-dark" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-treasury-base-darkest">
                          {item.label}
                        </span>
                        {item.requirement === "required" ? (
                          <span className="text-destructive">*</span>
                        ) : (
                          <Badge variant={config.variant} className="h-4 px-2 text-[10px]">
                            {config.label}
                          </Badge>
                        )}
                      </div>
                      {item.detail && (
                        <p className="mt-1 text-xs text-treasury-base-dark">
                          {item.detail}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 border border-treasury-base-light bg-treasury-base-lightest px-3 py-2 text-xs text-treasury-base-dark">
        Demo coverage: brand name, class/type, alcohol content, net contents,
        name/address, country of origin (imported only), and health warning.
      </div>
    </div>
  );
}
