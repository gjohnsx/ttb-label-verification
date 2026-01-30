"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export function DemoAssumptionsDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-treasury-primary"
          aria-label="View demo assumptions"
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>About This Demo</DialogTitle>
          <DialogDescription>
            Design assumptions and data sources for the CSV upload feature
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Why CSV Upload?</h3>
            <p className="text-muted-foreground">
              This feature demonstrates the end-to-end label verification pipeline
              without requiring direct integration with the COLA system. It allows
              interviewers to test the full workflow by uploading sample data.
            </p>
          </div>

          <div className="bg-treasury-base-lightest border-l-4 border-treasury-primary p-3">
            <p className="text-treasury-ink italic">
              "For this prototype, we're not looking to integrate with COLA
              directly—that's a whole different beast with its own authorization
              requirements. Think of this as a standalone proof-of-concept that
              could potentially inform future procurement decisions."
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              — Marcus Williams, IT Systems Administrator
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Assumptions</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>CSV format mirrors a potential COLA export structure</li>
              <li>Image URLs point to Azure Blob Storage for reliable access</li>
              <li>Batch processing supports Janet's workflow (200-300 labels)</li>
              <li>Real-time progress satisfies the &lt;5 second feedback requirement</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Data Source</h3>
            <p className="text-muted-foreground">
              Source:{" "}
              <a
                href="https://ttbonline.gov/colasonline/publicSearchColasBasic.do"
                target="_blank"
                rel="noopener noreferrer"
                className="text-treasury-primary hover:text-treasury-primary-dark hover:underline"
              >
                TTB COLA Online public search
              </a>
              . I downloaded application PDFs, extracted label images, ran Mistral
              OCR on the PDF text, and uploaded the images to Azure Blob Storage.
              Some PDFs omit fields (like alcohol content), so missing values are
              expected.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
