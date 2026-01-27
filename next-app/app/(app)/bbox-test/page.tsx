"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Loader2, X, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BoundingBox {
  label: string;
  box_2d: [number, number, number, number];
}

interface ExtractedFields {
  brandName: string | null;
  classType: string | null;
  alcoholContent: string | null;
  netContents: string | null;
  governmentWarning: string | null;
  bottlerName: string | null;
  bottlerAddress: string | null;
  countryOfOrigin: string | null;
}

interface ProcessingResult {
  success: boolean;
  config: {
    ocrConfigured: boolean;
    geminiConfigured: boolean;
    message: string;
  };
  ocr: {
    extractedFields: ExtractedFields;
    confidenceScores: Record<string, number>;
    processingTimeMs: number;
    modelVersion: string;
  };
  boundingBoxes: {
    boxes: BoundingBox[];
    processingTimeMs: number;
    modelVersion: string;
  };
}

// Color palette for bounding boxes
const BOX_COLORS = [
  { bg: "rgba(239, 68, 68, 0.2)", border: "#ef4444", text: "#dc2626" }, // red
  { bg: "rgba(34, 197, 94, 0.2)", border: "#22c55e", text: "#16a34a" }, // green
  { bg: "rgba(59, 130, 246, 0.2)", border: "#3b82f6", text: "#2563eb" }, // blue
  { bg: "rgba(168, 85, 247, 0.2)", border: "#a855f7", text: "#9333ea" }, // purple
  { bg: "rgba(249, 115, 22, 0.2)", border: "#f97316", text: "#ea580c" }, // orange
  { bg: "rgba(236, 72, 153, 0.2)", border: "#ec4899", text: "#db2777" }, // pink
  { bg: "rgba(20, 184, 166, 0.2)", border: "#14b8a6", text: "#0d9488" }, // teal
  { bg: "rgba(234, 179, 8, 0.2)", border: "#eab308", text: "#ca8a04" }, // yellow
  { bg: "rgba(99, 102, 241, 0.2)", border: "#6366f1", text: "#4f46e5" }, // indigo
];

export default function BboxTestPage() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBoxes, setShowBoxes] = useState(true);
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please drop an image file");
      return;
    }

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageDataUrl(dataUrl);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const processImage = async () => {
    if (!imageDataUrl) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/bbox-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Processing failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearImage = () => {
    setImageDataUrl(null);
    setImageDimensions(null);
    setResult(null);
    setError(null);
  };

  // Convert normalized coordinates to display pixels
  const getBoxStyle = (box: BoundingBox, index: number) => {
    if (!imageDimensions) return {};

    const [yMin, xMin, yMax, xMax] = box.box_2d;
    const color = BOX_COLORS[index % BOX_COLORS.length];

    return {
      left: `${(xMin / 1000) * 100}%`,
      top: `${(yMin / 1000) * 100}%`,
      width: `${((xMax - xMin) / 1000) * 100}%`,
      height: `${((yMax - yMin) / 1000) * 100}%`,
      backgroundColor: hoveredBox === index ? color.bg : "transparent",
      borderColor: color.border,
      borderWidth: hoveredBox === index ? "3px" : "2px",
    };
  };

  return (
    <div className="min-h-screen bg-treasury-base-lightest">
      <header className="border-b border-treasury-base-light bg-white px-6 py-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-treasury-ink">
            Bounding Box Test
          </h1>
          <p className="text-sm text-treasury-base-darkest mt-1">
            Test Gemini bounding box detection on TTB label images
          </p>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Image Upload & Display */}
          <div className="space-y-4">
            {!imageDataUrl ? (
              <Card>
                <CardContent className="p-0">
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                      relative min-h-[400px] flex flex-col items-center justify-center p-8
                      border-2 border-dashed rounded-lg transition-all cursor-pointer
                      ${
                        isDragging
                          ? "border-treasury-primary bg-treasury-primary-lightest"
                          : "border-treasury-base-dark hover:border-treasury-primary hover:bg-treasury-base-lightest"
                      }
                    `}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload
                      className={`size-12 mb-4 ${isDragging ? "text-treasury-primary" : "text-treasury-base-darkest"}`}
                    />
                    <p className="text-lg font-medium text-treasury-ink mb-2">
                      Drop a label image here
                    </p>
                    <p className="text-sm text-treasury-base-darkest">
                      or click to select a file
                    </p>
                    <p className="text-xs text-treasury-base-dark mt-4">
                      Supports JPG, PNG, WebP, and other image formats
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Label Image</CardTitle>
                    <div className="flex gap-2">
                      {result && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowBoxes(!showBoxes)}
                          title={
                            showBoxes
                              ? "Hide bounding boxes"
                              : "Show bounding boxes"
                          }
                        >
                          {showBoxes ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={clearImage}>
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {imageDimensions && (
                    <CardDescription>
                      {imageDimensions.width} x {imageDimensions.height} px
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div ref={containerRef} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imageRef}
                      src={imageDataUrl}
                      alt="Uploaded label"
                      className="w-full h-auto rounded-lg"
                    />

                    {/* Bounding box overlays */}
                    {showBoxes && result?.boundingBoxes.boxes.map((box, i) => (
                      <div
                        key={i}
                        className="absolute border-2 transition-all pointer-events-auto cursor-pointer"
                        style={getBoxStyle(box, i)}
                        onMouseEnter={() => setHoveredBox(i)}
                        onMouseLeave={() => setHoveredBox(null)}
                      >
                        {/* Label badge */}
                        <div
                          className="absolute -top-6 left-0 px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap"
                          style={{
                            backgroundColor:
                              BOX_COLORS[i % BOX_COLORS.length].border,
                            color: "white",
                          }}
                        >
                          {box.label.split(":")[0]}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={processImage}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="size-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : result ? (
                        <>
                          <RefreshCw className="size-4 mr-2" />
                          Reprocess
                        </>
                      ) : (
                        "Detect Elements"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-4">
            {/* Config status */}
            {result && (
              <Card size="sm">
                <CardContent className="py-3">
                  <p
                    className={`text-sm ${result.config.ocrConfigured && result.config.geminiConfigured ? "text-green-600" : "text-amber-600"}`}
                  >
                    {result.config.message}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Bounding Boxes Legend */}
            {result && result.boundingBoxes.boxes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Detected Elements ({result.boundingBoxes.boxes.length})
                  </CardTitle>
                  <CardDescription>
                    Processed in {result.boundingBoxes.processingTimeMs}ms using{" "}
                    {result.boundingBoxes.modelVersion}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.boundingBoxes.boxes.map((box, i) => {
                      const color = BOX_COLORS[i % BOX_COLORS.length];
                      const [labelType, ...labelValue] = box.label.split(":");
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-2 rounded transition-colors cursor-pointer ${
                            hoveredBox === i ? "bg-treasury-base-lightest" : ""
                          }`}
                          onMouseEnter={() => setHoveredBox(i)}
                          onMouseLeave={() => setHoveredBox(null)}
                        >
                          <div
                            className="w-4 h-4 rounded shrink-0 mt-0.5"
                            style={{ backgroundColor: color.border }}
                          />
                          <div className="min-w-0">
                            <p
                              className="font-medium text-sm"
                              style={{ color: color.text }}
                            >
                              {labelType.trim()}
                            </p>
                            {labelValue.length > 0 && (
                              <p className="text-sm text-treasury-base-darkest truncate">
                                {labelValue.join(":").trim()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* OCR Results */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">OCR Extracted Fields</CardTitle>
                  <CardDescription>
                    Processed in {result.ocr.processingTimeMs}ms using{" "}
                    {result.ocr.modelVersion}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(result.ocr.extractedFields).map(
                      ([key, value]) => {
                        if (key === "confidenceScores") return null;
                        const confidence =
                          result.ocr.confidenceScores[key as keyof typeof result.ocr.confidenceScores];
                        const fieldName = key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase());

                        return (
                          <div
                            key={key}
                            className="border-b border-treasury-base-light pb-2 last:border-0"
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-medium text-treasury-ink">
                                {fieldName}
                              </p>
                              {confidence !== undefined && (
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    confidence >= 0.9
                                      ? "bg-green-100 text-green-700"
                                      : confidence >= 0.7
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {Math.round(confidence * 100)}%
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-treasury-base-darkest mt-1">
                              {value || (
                                <span className="italic text-treasury-base">
                                  Not detected
                                </span>
                              )}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {!result && imageDataUrl && !isProcessing && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-treasury-base-darkest">
                    Click &quot;Detect Elements&quot; to process the image
                  </p>
                </CardContent>
              </Card>
            )}

            {!imageDataUrl && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-treasury-base-darkest">
                    Upload an image to see detection results
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
