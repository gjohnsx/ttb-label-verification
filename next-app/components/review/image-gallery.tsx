"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ImageOffIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  LoaderIcon,
} from "lucide-react";
import { VisuallyHidden } from "radix-ui";

export type LabelImage = {
  id: string;
  blobUrl: string;
  imageType: string;
};

// Ordering for image types - front first, then back, then others
const IMAGE_TYPE_ORDER: Record<string, number> = {
  FRONT: 1,
  BACK: 2,
  NECK: 3,
  STRIP: 4,
  SHOULDER: 5,
};

// Human-readable image type labels
const IMAGE_TYPE_LABELS: Record<string, string> = {
  FRONT: "Front Label",
  BACK: "Back Label",
  NECK: "Neck Label",
  STRIP: "Strip Label",
  SHOULDER: "Shoulder Label",
};

function getImageTypeOrder(type: string): number {
  return IMAGE_TYPE_ORDER[type.toUpperCase()] || 99;
}

function getImageTypeLabel(type: string): string {
  return IMAGE_TYPE_LABELS[type.toUpperCase()] || type;
}

function sortImages(images: LabelImage[]): LabelImage[] {
  return [...images].sort(
    (a, b) => getImageTypeOrder(a.imageType) - getImageTypeOrder(b.imageType)
  );
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
function useResolvedImageUrl(image: LabelImage | null): {
  url: string | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!image) {
      setUrl(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function resolveUrl() {
      setIsLoading(true);
      setError(null);

      // For local URLs, use directly without API call
      if (!isAzureBlobUrl(image!.blobUrl)) {
        setUrl(image!.blobUrl);
        setIsLoading(false);
        return;
      }

      // For Azure blob URLs, fetch SAS URL from API
      try {
        const response = await fetch(`/api/images/${image!.id}/url`);
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
  }, [image?.id, image?.blobUrl]);

  return { url, isLoading, error };
}

type ImageThumbnailProps = {
  image: LabelImage;
  onClick: () => void;
  isActive?: boolean;
};

function ImageThumbnail({ image, onClick, isActive }: ImageThumbnailProps) {
  const { url, isLoading, error } = useResolvedImageUrl(image);
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden border bg-white text-left shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-treasury-primary focus:ring-offset-2 cursor-pointer",
        isActive
          ? "border-treasury-primary ring-1 ring-treasury-primary"
          : "border-gray-200 hover:border-treasury-primary/50"
      )}
    >
      {/* Image Area - Top 2/3 roughly */}
      <div className="relative aspect-4/3 w-full bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoaderIcon className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
        
        {error || hasImageError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageOffIcon className="h-8 w-8 text-gray-300" />
          </div>
        ) : url ? (
          <Image
            src={url}
            alt={getImageTypeLabel(image.imageType)}
            fill
            className="object-contain p-4"
            onError={() => setHasImageError(true)}
            unoptimized={url.endsWith(".svg")}
          />
        ) : null}
      </div>

      {/* Content Area - Bottom */}
      <div className="border-t border-gray-100 bg-white px-4 py-3">
        <h3 className="font-medium text-treasury-base-darkest">
          {getImageTypeLabel(image.imageType)}
        </h3>
        <p className="text-xs text-gray-500">
          Click to expand
        </p>
      </div>
    </button>
  );
}

type LightboxProps = {
  images: LabelImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxProps) {
  const currentImage = images[currentIndex];
  const { url, isLoading, error } = useResolvedImageUrl(currentImage);
  const [hasImageError, setHasImageError] = useState(false);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, images.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, onClose]);

  // Reset error state when image changes
  useEffect(() => {
    setHasImageError(false);
  }, [currentIndex]);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay />

        {/* Navigation arrows - in portal, outside content */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          disabled={!hasPrevious}
          className={cn(
            "fixed left-4 top-1/2 -translate-y-1/2 z-50 h-14 w-14 bg-white/90 hover:bg-white text-treasury-base-darkest",
            !hasPrevious && "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronLeftIcon className="h-10 w-10" />
          <span className="sr-only">Previous image</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          disabled={!hasNext}
          className={cn(
            "fixed right-4 top-1/2 -translate-y-1/2 z-50 h-14 w-14 bg-white/90 hover:bg-white text-treasury-base-darkest",
            !hasNext && "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronRightIcon className="h-10 w-10" />
          <span className="sr-only">Next image</span>
        </Button>

        {/* Dialog content */}
        <div
          className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-8rem)] max-w-5xl h-[90vh] flex flex-col bg-white border border-treasury-base-light shadow-lg overflow-hidden"
        >
          <VisuallyHidden.Root>
            <DialogTitle>
              {currentImage ? getImageTypeLabel(currentImage.imageType) : "Image"}
            </DialogTitle>
          </VisuallyHidden.Root>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-treasury-base-lightest border-b border-treasury-base-light">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="text-xs font-semibold uppercase"
              >
                {currentImage?.imageType}
              </Badge>
              <span className="text-treasury-base-dark text-sm">
                {currentIndex + 1} of {images.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="text-treasury-base-dark hover:text-treasury-base-darkest"
            >
              <XIcon className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Main image area */}
          <div className="flex-1 flex items-center justify-center min-h-0 bg-treasury-base-lightest">
            <div className="flex items-center justify-center w-full h-full p-8">
              {isLoading && (
                <div className="flex flex-col items-center gap-3">
                  <LoaderIcon className="h-10 w-10 animate-spin text-treasury-base" />
                  <p className="text-treasury-base-dark text-sm">Loading image...</p>
                </div>
              )}

              {(error || hasImageError) && (
                <div className="flex flex-col items-center gap-3 text-treasury-base">
                  <ImageOffIcon className="h-16 w-16" />
                  <p className="text-sm">Image not available</p>
                </div>
              )}

              {url && !isLoading && !error && !hasImageError && (
                <Image
                  src={url}
                  alt={getImageTypeLabel(currentImage.imageType)}
                  width={1200}
                  height={900}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setHasImageError(true)}
                  priority
                  unoptimized={url.endsWith(".svg")}
                />
              )}
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-treasury-base-lightest border-t border-treasury-base-light">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => onNavigate(idx)}
                  className={cn(
                    "w-16 h-12 overflow-hidden border-2 transition-all",
                    idx === currentIndex
                      ? "border-treasury-primary"
                      : "border-treasury-base-light opacity-60 hover:opacity-100"
                  )}
                >
                  <ThumbnailImage image={img} />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogPortal>
    </Dialog>
  );
}

function ThumbnailImage({ image }: { image: LabelImage }) {
  const { url } = useResolvedImageUrl(image);

  if (!url) {
    return <div className="w-full h-full bg-treasury-base-light" />;
  }

  return (
    <Image
      src={url}
      alt={image.imageType}
      width={64}
      height={48}
      className="w-full h-full object-cover"
      unoptimized={url.endsWith(".svg")}
    />
  );
}

type ImageGalleryProps = {
  images: LabelImage[];
  className?: string;
};

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle no images case
  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "border border-dashed border-treasury-base bg-treasury-base-lightest p-8 text-center",
          className
        )}
      >
        <ImageOffIcon className="mx-auto h-12 w-12 text-treasury-base" />
        <p className="mt-2 text-sm font-medium text-treasury-base-dark">
          No label images available
        </p>
        <p className="mt-1 text-xs text-treasury-base">
          Images will appear here once uploaded
        </p>
      </div>
    );
  }

  // Sort images by type for consistent ordering
  const sortedImages = sortImages(images);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className={className}>
      {/* Stacked thumbnails */}
      <div className="flex flex-col gap-6">
        {sortedImages.map((image, index) => (
          <ImageThumbnail
            key={image.id}
            image={image}
            onClick={() => openLightbox(index)}
          />
        ))}
      </div>

      {/* Image count */}
      <p className="mt-4 text-center text-xs text-gray-400">
        Showing {sortedImages.length} image{sortedImages.length !== 1 ? "s" : ""}
      </p>

      {/* Lightbox */}
      <Lightbox
        images={sortedImages}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentIndex}
      />
    </div>
  );
}
