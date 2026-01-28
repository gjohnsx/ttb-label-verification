import { AppHeader } from "@/components/layout/app-header";
import { UploadForm } from "./upload-form";
import { DownloadSampleButton } from "./download-sample-button";
import { DemoAssumptionsDialog } from "./demo-assumptions-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, Upload, Eye } from "lucide-react";

export default function UploadPage() {
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
                  <h3 className="font-medium">1. Download Sample CSV</h3>
                  <p className="text-sm text-muted-foreground">
                    Get a pre-populated CSV with 30 sample applications including
                    clean matches, warning issues, and OCR challenges.
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
                    Drag and drop the CSV file or click to browse. The system will
                    validate the file format before processing.
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
                    See real-time progress as each application is processed through
                    OCR and verification. Results appear in the queue.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <DownloadSampleButton />
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
              <UploadForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
