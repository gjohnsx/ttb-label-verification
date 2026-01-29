"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";

type SampleOption = {
  label: string;
  filename: string;
  fileLabel: string;
};

const SAMPLE_OPTIONS: SampleOption[] = [
  {
    label: "3 rows",
    filename: "/sample-csv/scraped-import-3.csv",
    fileLabel: "scraped-import-3.csv",
  },
  {
    label: "6 rows",
    filename: "/sample-csv/scraped-import-6.csv",
    fileLabel: "scraped-import-6.csv",
  },
  {
    label: "15 rows",
    filename: "/sample-csv/scraped-import-15.csv",
    fileLabel: "scraped-import-15.csv",
  },
  {
    label: "24 rows",
    filename: "/sample-csv/scraped-import-24.csv",
    fileLabel: "scraped-import-24.csv",
  },
];

type QuickSampleButtonsProps = {
  onSelect: (file: File) => void;
};

export function QuickSampleButtons({ onSelect }: QuickSampleButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (option: SampleOption) => {
    try {
      setLoading(option.filename);
      const response = await fetch(option.filename);
      const text = await response.text();
      const file = new File([text], option.fileLabel, { type: "text/csv" });
      onSelect(file);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {SAMPLE_OPTIONS.map((option) => {
        const isLoading = loading === option.filename;
        return (
          <Button
            key={option.filename}
            variant="primary-outline"
            size="sm"
            onClick={() => handleSelect(option)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
