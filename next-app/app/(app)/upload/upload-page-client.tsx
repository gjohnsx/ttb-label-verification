"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { UploadForm } from "./upload-form";
import { DemoAssumptionsDialog } from "./demo-assumptions-dialog";
import { QuickSampleButtons } from "./quick-sample-buttons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, Upload, Eye } from "lucide-react";

export function UploadPageClient() {
  const [presetFile, setPresetFile] = useState<File | null>(null);

  return (
    <>
      <AppHeader />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-1">Batch Upload</h1>
        <p className="text-muted-foreground mb-6">
          Upload a CSV file to process multiple label applications at once.
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Instructions Card */}
          <Card>
            <CardHeader className="relative">
              <div className="absolute top-4 right-4">
                <DemoAssumptionsDialog />
              </div>
              <CardTitle className="text-lg">Demo Instructions</CardTitle>
              <CardDescription>
                Follow these steps to test the batch upload workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-treasury-primary/10 text-treasury-primary">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">1. Choose a sample size</h3>
                  <p className="text-sm text-muted-foreground">
                    Pick a pre-built CSV (3, 6, 15, or 24 rows). This will load it
                    into the uploader automatically.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-treasury-primary/10 text-treasury-primary">
                  <Upload className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">2. Upload the CSV</h3>
                  <p className="text-sm text-muted-foreground">
                    Click “Upload &amp; Process” to start OCR and verification.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-treasury-primary/10 text-treasury-primary">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">3. Watch Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Track progress as each application runs through OCR and comparison.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <QuickSampleButtons onSelect={setPresetFile} />
              </div>
            </CardContent>
          </Card>

          {/* Upload Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload CSV File</CardTitle>
              <CardDescription>
                CSV must include TTB_ID, BRAND_NAME, and IMAGE_URLS columns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadForm
                presetFile={presetFile}
                onClearPreset={() => setPresetFile(null)}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
