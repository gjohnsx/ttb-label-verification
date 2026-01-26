"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const IMAGE_TYPE_ORDER: Record<string, number> = {
  FRONT: 1,
  BACK: 2,
  NECK: 3,
  STRIP: 4,
  SHOULDER: 5,
};

function getImageTypeOrder(type: string): number {
  return IMAGE_TYPE_ORDER[type.toUpperCase()] || 99;
}

export type OcrResultData = {
  imageId: string;
  imageType: string;
  rawMarkdown: string | null;
};

type OcrRawViewerProps = {
  ocrResults: OcrResultData[];
  className?: string;
};

export function OcrRawViewer({ ocrResults, className }: OcrRawViewerProps) {
  // Sort by image type order
  const sortedResults = [...ocrResults].sort(
    (a, b) => getImageTypeOrder(a.imageType) - getImageTypeOrder(b.imageType)
  );

  // Check if there's any OCR content
  const hasContent = sortedResults.some((r) => r.rawMarkdown);

  if (!hasContent) {
    return (
      <div className="border border-treasury-base-light bg-treasury-base-lightest p-8 text-center">
        <p className="text-treasury-base-dark">
          No OCR text available. Run OCR to see extracted text from label
          images.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {sortedResults.map((result) => (
        <OcrImageSection key={result.imageId} result={result} />
      ))}
    </div>
  );
}

function OcrImageSection({ result }: { result: OcrResultData }) {
  const [copied, setCopied] = useState(false);

  if (!result.rawMarkdown) {
    return (
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-treasury-base-dark">
          {result.imageType} Label
        </h3>
        <div className="border border-treasury-base-light bg-treasury-base-lightest p-4 text-sm text-treasury-base">
          No OCR text for this image.
        </div>
      </div>
    );
  }

  // Format the content for display
  const formattedContent = formatOcrContent(result.rawMarkdown);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-treasury-base-dark">
        {result.imageType} Label
      </h3>
      <div className="relative border border-treasury-base-light bg-treasury-base-lightest">
        <button
          onClick={handleCopy}
          className={cn(
            "absolute right-2 top-2 flex items-center gap-1.5 px-2 py-1 text-xs transition-colors",
            copied
              ? "text-green-600"
              : "text-treasury-base hover:text-treasury-base-darkest"
          )}
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
        <div className="max-h-[500px] overflow-y-auto p-4 pr-20">
          <pre className="whitespace-pre-wrap font-mono text-sm text-treasury-base-darkest">
            {formattedContent}
          </pre>
        </div>
      </div>
    </div>
  );
}

function formatOcrContent(rawMarkdown: string): string {
  // Try to parse as JSON and pretty-print
  try {
    const parsed = JSON.parse(rawMarkdown);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // Not JSON, return as-is
    return rawMarkdown;
  }
}
