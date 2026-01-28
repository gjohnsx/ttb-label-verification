import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Upload } from "lucide-react";
import prisma from "@/lib/prisma";

type SummaryPageProps = {
  searchParams: Promise<{
    runId?: string;
    total?: string;
  }>;
};

async function getUploadSummary(runId: string | undefined, total: number) {
  // If we have a runId, we could potentially look up the specific batch
  // For now, we'll get counts from recently created applications
  // In a real implementation, you'd track batch metadata

  // Get counts by status for recently created applications
  const [readyCount, needsAttentionCount, errorCount] = await Promise.all([
    prisma.application.count({
      where: { status: "READY" },
    }),
    prisma.application.count({
      where: { status: "NEEDS_ATTENTION" },
    }),
    prisma.application.count({
      where: { status: "ERROR" },
    }),
  ]);

  return {
    total,
    readyCount: Math.min(readyCount, total),
    needsAttentionCount: Math.min(needsAttentionCount, total - readyCount),
    errorCount: Math.min(errorCount, total - readyCount - needsAttentionCount),
  };
}

export default async function UploadSummaryPage({ searchParams }: SummaryPageProps) {
  const params = await searchParams;
  const totalRows = params.total ? parseInt(params.total, 10) : 0;
  const summary = await getUploadSummary(params.runId, totalRows);

  return (
    <>
      <AppHeader />
      <main className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Upload Complete</h1>
            <p className="text-muted-foreground">
              Successfully processed {summary.total} applications
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Ready
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {summary.readyCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Needs Attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">
                  {summary.needsAttentionCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Error
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {summary.errorCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button asChild variant="primary-outline" className="flex-1">
              <Link href="/upload">
                <Upload className="h-4 w-4" />
                Upload Another
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/queue">
                Go to Queue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
