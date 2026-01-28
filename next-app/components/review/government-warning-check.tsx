"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon, XIcon, ChevronDownIcon } from "lucide-react";

const REQUIRED_TEXT =
  "GOVERNMENT WARNING: (1) ACCORDING TO THE SURGEON GENERAL, WOMEN SHOULD NOT DRINK ALCOHOLIC BEVERAGES DURING PREGNANCY BECAUSE OF THE RISK OF BIRTH DEFECTS. (2) CONSUMPTION OF ALCOHOLIC BEVERAGES IMPAIRS YOUR ABILITY TO DRIVE A CAR OR OPERATE MACHINERY, AND MAY CAUSE HEALTH PROBLEMS.";

type GovernmentWarningCheckProps = {
  ocrValue: string | null;
  ocrConfidence?: number;
};

/**
 * Word-level diff between expected and actual text.
 * Returns spans with highlights for differences.
 */
function diffWords(expected: string, actual: string) {
  const expectedWords = expected.split(/\s+/);
  const actualWords = actual.split(/\s+/);

  const maxLen = Math.max(expectedWords.length, actualWords.length);
  const expectedSpans: { text: string; ok: boolean }[] = [];
  const actualSpans: { text: string; ok: boolean }[] = [];

  for (let i = 0; i < maxLen; i++) {
    const ew = expectedWords[i];
    const aw = actualWords[i];

    if (ew !== undefined) {
      expectedSpans.push({
        text: ew,
        ok: aw !== undefined && ew.toUpperCase() === aw.toUpperCase(),
      });
    }
    if (aw !== undefined) {
      actualSpans.push({
        text: aw,
        ok: ew !== undefined && ew.toUpperCase() === aw.toUpperCase(),
      });
    }
  }

  return { expectedSpans, actualSpans };
}

function DiffText({ spans }: { spans: { text: string; ok: boolean }[] }) {
  return (
    <p className="text-sm leading-relaxed">
      {spans.map((span, i) => (
        <span key={i}>
          {i > 0 && " "}
          <span
            className={cn(
              !span.ok && "bg-treasury-warning-lightest text-treasury-warning-dark font-medium"
            )}
          >
            {span.text}
          </span>
        </span>
      ))}
    </p>
  );
}

function ExpandableOcrText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-5 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-treasury-base-dark hover:text-treasury-base-darkest transition-colors"
      >
        <ChevronDownIcon
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180"
          )}
        />
        {open ? "Hide OCR text" : "Show OCR text"}
      </button>
      {open && (
        <p className="mt-3 text-sm leading-relaxed text-treasury-base-darkest">
          {text}
        </p>
      )}
    </div>
  );
}

export function GovernmentWarningCheck({
  ocrValue,
  ocrConfidence,
}: GovernmentWarningCheckProps) {
  const trimmedOcr = ocrValue?.trim() ?? null;
  const isMatch =
    trimmedOcr !== null &&
    trimmedOcr.toUpperCase() === REQUIRED_TEXT.toUpperCase();
  const isPresent = trimmedOcr !== null && trimmedOcr.length > 0;

  const hasDifferences = isPresent && !isMatch;
  const diff = hasDifferences ? diffWords(REQUIRED_TEXT, trimmedOcr) : null;

  return (
    <div className="border bg-card shadow-sm">
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 px-5 py-3 border-b",
          isMatch
            ? "bg-treasury-secondary-lightest/50"
            : "bg-treasury-warning-lightest/50"
        )}
      >
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
            isMatch
              ? "bg-treasury-secondary text-white"
              : "bg-treasury-warning text-white"
          )}
        >
          {isMatch ? (
            <CheckIcon className="h-3.5 w-3.5" />
          ) : (
            <XIcon className="h-3.5 w-3.5" />
          )}
        </div>
        <h3 className="text-sm font-semibold">Government Warning</h3>
        <span
          className={cn(
            "ml-auto text-xs font-medium",
            isMatch
              ? "text-treasury-secondary-dark"
              : "text-treasury-warning-dark"
          )}
        >
          {isMatch
            ? "Exact match"
            : !isPresent
              ? "Not found on label"
              : "Differences found"}
        </span>
        {ocrConfidence !== undefined && (
          <span className="text-[10px] text-treasury-secondary-dark font-medium">
            {Math.round(ocrConfidence * 100)}%
          </span>
        )}
      </div>

      {/* Body */}
      {isMatch ? (
        <ExpandableOcrText text={trimmedOcr!} />
      ) : (
        /* Side-by-side when there are differences */
        <div className="grid grid-cols-2 divide-x">
          <div className="px-5 py-4 space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-treasury-base-dark">
              Required Text
            </p>
            {diff ? (
              <DiffText spans={diff.expectedSpans} />
            ) : (
              <p className="text-sm leading-relaxed">{REQUIRED_TEXT}</p>
            )}
          </div>
          <div className="px-5 py-4 space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-treasury-base-dark">
              Label Text (OCR)
            </p>
            {!isPresent ? (
              <p className="text-sm italic text-treasury-base-light">
                No government warning text detected on label.
              </p>
            ) : diff ? (
              <DiffText spans={diff.actualSpans} />
            ) : (
              <p className="text-sm leading-relaxed">{trimmedOcr}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
