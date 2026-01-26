"use client";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageViewer, ImageViewerPlaceholder, type LabelImage } from "./image-viewer";

type ImageCarouselProps = {
  images: LabelImage[];
  className?: string;
};

// Ordering for image types - front first, then back, then others
const IMAGE_TYPE_ORDER: Record<string, number> = {
  FRONT: 1,
  BACK: 2,
  NECK: 3,
  STRIP: 4,
  SHOULDER: 5,
};

function getImageTypeOrder(type: string): number {
  return IMAGE_TYPE_ORDER[type.toUpperCase()] || 99;
}

function sortImages(images: LabelImage[]): LabelImage[] {
  return [...images].sort(
    (a, b) => getImageTypeOrder(a.imageType) - getImageTypeOrder(b.imageType)
  );
}

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  // Handle no images case
  if (!images || images.length === 0) {
    return <ImageViewerPlaceholder className={className} />;
  }

  // Sort images by type for consistent ordering
  const sortedImages = sortImages(images);

  // Single image case - no tabs needed
  if (sortedImages.length === 1) {
    return (
      <div className={className}>
        <ImageViewer image={sortedImages[0]} />
        <div className="mt-2 text-center text-xs text-treasury-base">
          1 of 1 images
        </div>
      </div>
    );
  }

  // Multiple images - use tabs
  return (
    <div className={className}>
      <Tabs defaultValue={sortedImages[0].id} className="w-full">
        {/* Tab Navigation */}
        <TabsList className="mb-3 w-full justify-start">
          {sortedImages.map((image, index) => (
            <TabsTrigger
              key={image.id}
              value={image.id}
              className="gap-1.5 px-3 text-sm"
            >
              <span className="font-medium uppercase">{image.imageType}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        {sortedImages.map((image, index) => (
          <TabsContent key={image.id} value={image.id} className="mt-0">
            <ImageViewer image={image} />
            <div className="mt-2 text-center text-xs text-treasury-base">
              {index + 1} of {sortedImages.length} images
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Compact version for smaller spaces
export function ImageCarouselCompact({ images, className }: ImageCarouselProps) {
  // Handle no images case
  if (!images || images.length === 0) {
    return (
      <div className={cn(" border border-dashed border-treasury-base-light bg-treasury-base-lightest p-4 text-center", className)}>
        <p className="text-sm text-treasury-base">No images</p>
      </div>
    );
  }

  const sortedImages = sortImages(images);

  // Single image - simplified view
  if (sortedImages.length === 1) {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="aspect-[3/4] overflow-hidden  border border-treasury-base-light">
          <img
            src={sortedImages[0].blobUrl}
            alt={sortedImages[0].imageType}
            className="h-full w-full object-contain"
          />
        </div>
        <p className="text-center text-xs text-treasury-base">
          {sortedImages[0].imageType}
        </p>
      </div>
    );
  }

  // Multiple images - thumbnail strip
  return (
    <Tabs defaultValue={sortedImages[0].id} className={cn("w-full", className)}>
      {/* Main image */}
      {sortedImages.map((image) => (
        <TabsContent key={image.id} value={image.id} className="mt-0">
          <div className="aspect-[3/4] overflow-hidden  border border-treasury-base-light">
            <img
              src={image.blobUrl}
              alt={image.imageType}
              className="h-full w-full object-contain"
            />
          </div>
        </TabsContent>
      ))}

      {/* Thumbnail tabs */}
      <TabsList className="mt-2 h-auto w-full flex-wrap justify-center gap-1 bg-transparent p-0">
        {sortedImages.map((image) => (
          <TabsTrigger
            key={image.id}
            value={image.id}
            className="h-auto rounded border border-treasury-base-light px-2 py-1 text-[10px] uppercase data-active:border-treasury-primary data-active:bg-treasury-primary-lightest"
          >
            {image.imageType}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
