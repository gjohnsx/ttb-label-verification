import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle, SkipForward, ArrowRight, Upload } from "lucide-react";
import prisma from "@/lib/prisma";

type SummaryContentAsyncProps = {
  runId?: string;
  total: number;
  skippedCount: number;
  applicationIds: string[];
};

async function getUploadSummary(runId: string | undefined, total: number) {
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

export async function SummaryContentAsync({ runId, total, skippedCount, applicationIds }: SummaryContentAsyncProps) {
  const summary = await getUploadSummary(runId, total);

  return (
    <>
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
      <div className={`grid gap-4 mb-8 ${skippedCount > 0 ? "grid-cols-4" : "grid-cols-3"}`}>
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
        {skippedCount > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <SkipForward className="h-4 w-4 text-muted-foreground" />
                Skipped
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-muted-foreground">
                {skippedCount}
              </p>
            </CardContent>
          </Card>
        )}
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
          <Link href={applicationIds.length > 0 ? `/queue?ids=${applicationIds.join(",")}` : "/queue"}>
            Go to Queue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </>
  );
}
