export type ChecklistRequirement = "required" | "conditional";

export type ChecklistItem = {
  label: string;
  detail?: string;
  requirement: ChecklistRequirement;
};

export type ChecklistSection = {
  title: string;
  items: ChecklistItem[];
};

export type LabelChecklist = {
  title: string;
  summary: string;
  sections: ChecklistSection[];
};

function normalizeProductType(productType?: string | null) {
  const value = productType?.toLowerCase() ?? "";
  if (value.includes("distilled")) return "DISTILLED_SPIRITS";
  if (value.includes("malt")) return "MALT_BEVERAGE";
  if (value.includes("wine")) return "WINE";
  return "UNKNOWN";
}

function buildCountryOfOriginItem(isImported: boolean): ChecklistItem {
  return {
    label: "Country of origin statement",
    detail: isImported
      ? "Required for imported products."
      : "Required for imported products only.",
    requirement: isImported ? "required" : "conditional",
  };
}

function buildNameAddressItem(isImported: boolean): ChecklistItem {
  return isImported
    ? {
        label: "Importer name & address (city, state)",
        detail: 'Must follow “Imported by” (or similar) with no intervening text.',
        requirement: "required",
      }
    : {
        label: "Bottler/producer name & address (city, state)",
        detail: 'Must follow “Bottled by” (or similar) with no intervening text.',
        requirement: "required",
      };
}

export function getLabelChecklist(
  productType?: string | null,
  sourceType?: string | null
): LabelChecklist | null {
  const type = normalizeProductType(productType);
  const isImported = sourceType?.toLowerCase() === "imported";

  if (type === "DISTILLED_SPIRITS") {
    return {
      title: "TTB Label Checklist — Distilled Spirits",
      summary: "Reference items based on the TTB distilled spirits checklist (27 CFR Part 5).",
      sections: [
        {
          title: "Core mandatory items",
          items: [
            {
              label: "Brand name",
              detail: "Must appear in the same field of vision as class/type and alcohol content.",
              requirement: "required",
            },
            {
              label: "Class/Type designation",
              detail: "Must appear in the same field of vision as brand name and alcohol content.",
              requirement: "required",
            },
            {
              label: "Alcohol content (ABV)",
              detail: "Must appear in the same field of vision as brand name and class/type.",
              requirement: "required",
            },
            {
              label: "Net contents",
              detail: "Must meet an approved standard of fill.",
              requirement: "required",
            },
            buildNameAddressItem(isImported),
            {
              label: "Health warning statement",
              detail: "Must match the exact required wording and punctuation.",
              requirement: "required",
            },
            buildCountryOfOriginItem(isImported),
          ],
        },
        {
          title: "Conditional disclosures (not auto-checked in MVP)",
          items: [
            {
              label: "Statement of composition / formula-driven statements",
              requirement: "conditional",
            },
            {
              label: "Age statement (if required for the spirit type)",
              requirement: "conditional",
            },
            {
              label: "Commodity/neutral spirits statements",
              requirement: "conditional",
            },
            {
              label: "Coloring disclosures (incl. FD&C Yellow #5, carmine)",
              requirement: "conditional",
            },
            {
              label: "Sulfite declaration (if ≥10 ppm)",
              requirement: "conditional",
            },
            {
              label: "Wood treatment statement (if applicable)",
              requirement: "conditional",
            },
            {
              label: "State of distillation (if required)",
              requirement: "conditional",
            },
          ],
        },
      ],
    };
  }

  if (type === "MALT_BEVERAGE") {
    return {
      title: "TTB Label Checklist — Malt Beverage",
      summary: "Reference items based on the TTB malt beverage checklist (27 CFR Part 7).",
      sections: [
        {
          title: "Core mandatory items",
          items: [
            {
              label: "Brand name",
              requirement: "required",
            },
            {
              label: "Designation (class/type or fanciful name + composition)",
              requirement: "required",
            },
            buildNameAddressItem(isImported),
            {
              label: "Net contents",
              requirement: "required",
            },
            {
              label: "Health warning statement",
              detail: "Must match the exact required wording and punctuation.",
              requirement: "required",
            },
            buildCountryOfOriginItem(isImported),
          ],
        },
        {
          title: "Conditional disclosures (not auto-checked in MVP)",
          items: [
            {
              label: "Alcohol content (ABV)",
              detail: "Required only if alcohol is derived from added flavors or required by a state.",
              requirement: "conditional",
            },
            {
              label: "Sulfite declaration (if ≥10 ppm)",
              requirement: "conditional",
            },
            {
              label: "FD&C Yellow #5 disclosure",
              requirement: "conditional",
            },
            {
              label: "Cochineal extract / carmine disclosure",
              requirement: "conditional",
            },
            {
              label: "Aspartame declaration",
              requirement: "conditional",
            },
          ],
        },
      ],
    };
  }

  if (type === "WINE") {
    return {
      title: "TTB Label Checklist — Wine",
      summary: "Reference items based on the TTB wine checklist (27 CFR Part 4).",
      sections: [
        {
          title: "Core mandatory items",
          items: [
            {
              label: "Brand name",
              requirement: "required",
            },
            {
              label: "Class/Type designation (or varietal)",
              requirement: "required",
            },
            {
              label: "Alcohol content (ABV)",
              detail: "Required; table wine has specific formatting/range rules.",
              requirement: "required",
            },
            {
              label: "Net contents",
              requirement: "required",
            },
            buildNameAddressItem(isImported),
            {
              label: "Health warning statement",
              detail: "Must match the exact required wording and punctuation.",
              requirement: "required",
            },
            buildCountryOfOriginItem(isImported),
          ],
        },
        {
          title: "Conditional disclosures (not auto-checked in MVP)",
          items: [
            {
              label: "Appellation of origin",
              detail: "Required when varietal/vintage/estate bottled references are used.",
              requirement: "conditional",
            },
            {
              label: "Sulfite declaration (if ≥10 ppm)",
              requirement: "conditional",
            },
            {
              label: "FD&C Yellow #5 disclosure",
              requirement: "conditional",
            },
            {
              label: "Cochineal extract / carmine disclosure",
              requirement: "conditional",
            },
            {
              label: "Percent of foreign wine (if referenced)",
              requirement: "conditional",
            },
          ],
        },
      ],
    };
  }

  return null;
}
