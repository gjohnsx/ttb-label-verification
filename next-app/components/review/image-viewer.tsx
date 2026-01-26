"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOffIcon, ZoomInIcon, LoaderIcon } from "lucide-react";

export type LabelImage = {
  id: string;
  blobUrl: string;
  imageType: string;
};

type ImageViewerProps = {
  image: LabelImage;
  className?: string;
};

// Human-readable image type labels
const IMAGE_TYPE_LABELS: Record<string, string> = {
  FRONT: "Front Label",
  BACK: "Back Label",
  NECK: "Neck Label",
  STRIP: "Strip Label",
  SHOULDER: "Shoulder Label",
};

// Badge colors for different image types
const IMAGE_TYPE_COLORS: Record<string, string> = {
  FRONT: "bg-treasury-primary text-white",
  BACK: "bg-treasury-secondary-dark text-white",
  NECK: "bg-treasury-accent-dark text-white",
  STRIP: "bg-treasury-base-dark text-white",
  SHOULDER: "bg-treasury-base-dark text-white",
};

function getImageTypeLabel(type: string): string {
  return IMAGE_TYPE_LABELS[type.toUpperCase()] || type;
}

function getImageTypeBadgeClass(type: string): string {
  return IMAGE_TYPE_COLORS[type.toUpperCase()] || "bg-treasury-base-dark text-white";
}

/**
 * Check if a URL is an Azure Blob Storage URL
 */
function isAzureBlobUrl(url: string): boolean {
  return url.includes(".blob.core.windows.net");
}

/**
 * Hook to resolve image URL, fetching SAS URL for Azure blobs
 */
function useResolvedImageUrl(image: LabelImage): {
  url: string | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function resolveUrl() {
      setIsLoading(true);
      setError(null);

      // For local URLs, use directly without API call
      if (!isAzureBlobUrl(image.blobUrl)) {
        setUrl(image.blobUrl);
        setIsLoading(false);
        return;
      }

      // For Azure blob URLs, fetch SAS URL from API
      try {
        const response = await fetch(`/api/images/${image.id}/url`);
        if (!response.ok) {
          throw new Error("Failed to fetch image URL");
        }
        const data = await response.json();
        if (isMounted) {
          setUrl(data.url);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    resolveUrl();

    return () => {
      isMounted = false;
    };
  }, [image.id, image.blobUrl]);

  return { url, isLoading, error };
}

export function ImageViewer({ image, className }: ImageViewerProps) {
  const { url: resolvedUrl, isLoading: isUrlLoading, error: urlError } = useResolvedImageUrl(image);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasImageError, setHasImageError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset image loading state when URL changes
  useEffect(() => {
    if (resolvedUrl) {
      setIsImageLoading(true);
      setHasImageError(false);
    }
  }, [resolvedUrl]);

  const handleLoad = () => {
    setIsImageLoading(false);
    setHasImageError(false);
  };

  const handleError = () => {
    setIsImageLoading(false);
    setHasImageError(true);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const isLoading = isUrlLoading || isImageLoading;
  const hasError = urlError || hasImageError;

  return (
    <Card className={cn("relative overflow-hidden p-0", className)}>
      {/* Image Type Badge */}
      <div className="absolute left-3 top-3 z-10">
        <Badge
          className={cn(
            "px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
            getImageTypeBadgeClass(image.imageType)
          )}
        >
          {image.imageType}
        </Badge>
      </div>

      {/* Zoom Button */}
      <button
        onClick={toggleZoom}
        className="absolute right-3 top-3 z-10 bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-white"
        aria-label={isZoomed ? "Zoom out" : "Zoom in"}
      >
        <ZoomInIcon className="h-4 w-4 text-treasury-base-dark" />
      </button>

      {/* Image Container */}
      <div
        className={cn(
          "relative flex min-h-[300px] items-center justify-center bg-treasury-base-lightest transition-all",
          isZoomed && "cursor-zoom-out",
          !isZoomed && "cursor-zoom-in"
        )}
        onClick={toggleZoom}
      >
        {/* URL Loading State */}
        {isUrlLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <LoaderIcon className="h-8 w-8 animate-spin text-treasury-base" />
              <p className="text-sm text-treasury-base-dark">Loading image...</p>
            </div>
          </div>
        )}

        {/* Image Loading State */}
        {!isUrlLoading && isImageLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-treasury-base">
            <ImageOffIcon className="h-12 w-12" />
            <p className="text-sm font-medium">Image not available</p>
            <p className="text-xs text-treasury-base-dark">
              {getImageTypeLabel(image.imageType)}
            </p>
          </div>
        )}

        {/* Image */}
        {resolvedUrl && !hasError && (
          <div
            className={cn(
              "relative w-full transition-transform duration-200",
              isZoomed ? "scale-150" : "scale-100"
            )}
          >
            <Image
              src={resolvedUrl}
              alt={getImageTypeLabel(image.imageType)}
              width={400}
              height={600}
              className={cn(
                "mx-auto h-auto max-h-[500px] w-auto object-contain",
                isImageLoading && "opacity-0"
              )}
              onLoad={handleLoad}
              onError={handleError}
              priority
              unoptimized={resolvedUrl.endsWith('.svg')}
            />
          </div>
        )}
      </div>

      {/* Source Label */}
      <div className="border-t border-treasury-base-light bg-white px-4 py-2">
        <p className="text-xs text-treasury-base-dark">
          <span className="font-medium">From:</span>{" "}
          {getImageTypeLabel(image.imageType)}
        </p>
      </div>
    </Card>
  );
}

// Placeholder component when no images are available
export function ImageViewerPlaceholder({ className }: { className?: string }) {
  return (
    <Card className={cn("p-0", className)}>
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 bg-treasury-base-lightest p-8">
        <ImageOffIcon className="h-16 w-16 text-treasury-base-light" />
        <div className="text-center">
          <p className="font-medium text-treasury-base-dark">
            No label images available
          </p>
          <p className="mt-1 text-sm text-treasury-base">
            Label images will appear here once uploaded
          </p>
        </div>
      </div>
    </Card>
  );
}
