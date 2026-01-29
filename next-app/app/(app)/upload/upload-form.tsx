"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadProgressModal } from "@/components/upload/upload-progress-modal";
import { parseCSVFile } from "@/lib/csv/parser";
import type { CsvValidationError } from "@/lib/csv/types";

type UploadState = "idle" | "selected" | "uploading" | "processing" | "complete";
type PreflightStatus = "idle" | "parsing" | "uploading" | "error" | "done";

type UploadFormProps = {
  presetFile?: File | null;
  onClearPreset?: () => void;
};

export function UploadForm({ presetFile, onClearPreset }: UploadFormProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<CsvValidationError[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  const [preflightStatus, setPreflightStatus] = useState<PreflightStatus>("idle");
  const [preflightTotalRows, setPreflightTotalRows] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!presetFile) return;
    if (state === "uploading" || state === "processing") return;
    setFile(presetFile);
    setState("selected");
    setErrors([]);
    setErrorMessage(null);
  }, [presetFile, state]);

  const resetState = useCallback(() => {
    setState("idle");
    setFile(null);
    setErrors([]);
    setErrorMessage(null);
    setRunId(null);
    setTotalRows(0);
    setPreflightStatus("idle");
    setPreflightTotalRows(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile);
      setState("selected");
      setErrors([]);
      setErrorMessage(null);
    } else {
      setErrorMessage("Please drop a CSV file");
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        setState("selected");
        setErrors([]);
        setErrorMessage(null);
      } else {
        setErrorMessage("Please select a CSV file");
      }
    }
  }, []);

  const handleRemove = useCallback(() => {
    resetState();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClearPreset?.();
  }, [resetState, onClearPreset]);

  const handleUpload = async () => {
    if (!file) return;

    setState("uploading");
    setErrors([]);
    setErrorMessage(null);
    setRunId(null);
    setTotalRows(0);
    setPreflightStatus("parsing");
    setPreflightTotalRows(null);
    setIsModalOpen(true);

    try {
      const preflight = await parseCSVFile(file);

      if (!preflight.success) {
        setErrors(preflight.errors);
        setErrorMessage("CSV validation failed");
        setState("selected");
        setPreflightStatus("error");
        setIsModalOpen(false);
        return;
      }

      setPreflightTotalRows(preflight.totalRows);
      setPreflightStatus("uploading");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        if (data.errors && data.errors.length > 0) {
          setErrors(data.errors);
        }
        setErrorMessage(data.error || "Upload failed");
        setState("selected");
        setPreflightStatus("error");
        setIsModalOpen(false);
        return;
      }

      // Success - start processing
      setRunId(data.runId);
      setTotalRows(data.totalRows);
      setPreflightStatus("done");
      setState("processing");
      setIsModalOpen(true);
    } catch (error) {
      setErrorMessage("Upload failed. Please try again.");
      setState("selected");
      setPreflightStatus("error");
      setIsModalOpen(false);
    }
  };

  const handleProcessingComplete = ({ skippedCount, applicationIds }: { skippedCount: number; applicationIds: string[] }) => {
    setIsModalOpen(false);
    const params = new URLSearchParams({ runId: runId!, total: String(totalRows) });
    if (skippedCount > 0) params.set("skipped", String(skippedCount));
    if (applicationIds.length > 0) params.set("ids", applicationIds.join(","));
    router.push(`/upload/summary?${params}`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => state === "idle" && fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed p-8 text-center transition-colors",
          state === "idle" && "cursor-pointer hover:border-treasury-primary hover:bg-treasury-primary/5",
          isDragging && "border-treasury-primary bg-treasury-primary/5",
          state === "selected" && "border-muted-foreground/25",
          (state === "uploading" || state === "processing") && "border-muted-foreground/25 opacity-50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          disabled={state === "uploading" || state === "processing"}
        />

        {state === "idle" && (
          <div className="space-y-2">
            <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drop your CSV file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum 500 rows per upload
            </p>
          </div>
        )}

        {(state === "selected" || state === "uploading") && file && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-treasury-primary" />
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            {state === "selected" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {state === "uploading" && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {errorMessage && (
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">{errorMessage}</p>
            {errors.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-sm">
                {errors.slice(0, 5).map((error, i) => (
                  <li key={i}>
                    Row {error.row}: {error.column && `${error.column} - `}
                    {error.message}
                  </li>
                ))}
                {errors.length > 5 && (
                  <li>...and {errors.length - 5} more errors</li>
                )}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      {state === "selected" && (
        <div className="flex gap-2">
          <Button variant="primary-outline" onClick={handleRemove} className="flex-1">
            Remove
          </Button>
          <Button onClick={handleUpload} className="flex-1">
            <Upload className="h-4 w-4" />
            Upload & Process
          </Button>
        </div>
      )}

      {/* Banner when modal is closed but processing/complete */}
      {(state === "processing" || state === "complete") && !isModalOpen && (
        <div className="flex items-center justify-between border p-4 bg-treasury-base-lightest">
          <div className="flex items-center gap-3">
            {state === "processing" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-treasury-primary" />
                <span className="text-sm font-medium">Processing {totalRows} applications...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Finished processing {totalRows} applications</span>
              </>
            )}
          </div>
          <Button variant="primary-outline" size="sm" onClick={() => setIsModalOpen(true)}>
            {state === "processing" ? "View Progress" : "View Results"}
          </Button>
        </div>
      )}

      {/* Progress Modal */}
      <UploadProgressModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        runId={runId}
        totalRows={totalRows}
        preflight={{
          status: preflightStatus,
          totalRows: preflightTotalRows,
        }}
        onComplete={handleProcessingComplete}
        onProcessingDone={() => setState("complete")}
      />
    </div>
  );
}
