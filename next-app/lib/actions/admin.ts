'use server';

import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/dal';

export type ResetDemoResult =
  | { success: true; message: string; deletedCounts: DeletedCounts }
  | { success: false; error: string };

export interface DeletedCounts {
  auditEvents: number;
  reviews: number;
  comparisons: number;
  ocrResults: number;
  applicationsReset: number;
}

/**
 * Reset demo data - clears all user-generated data and resets application statuses.
 *
 * This action:
 * 1. Verifies the user is authenticated
 * 2. Verifies the secret matches DEMO_RESET_SECRET
 * 3. Deletes all AuditEvent records
 * 4. Deletes all Review records
 * 5. Deletes all Comparison records
 * 6. Deletes all OcrResult records
 * 7. Resets all Application statuses to READY or NEEDS_ATTENTION based on test category
 *
 * Protected by secret token for defense in depth.
 */
/**
 * Delete a single application and all related data (images, OCR results, comparisons, reviews, audit events).
 */
export async function deleteApplication(applicationId: string): Promise<{ success: true } | { success: false; error: string }> {
  const session = await verifySession();
  console.log(`[Admin] Delete application ${applicationId} by agent: ${session.agentName}`);

  try {
    await prisma.$transaction(async (tx) => {
      // Get image IDs for this application
      const images = await tx.labelImage.findMany({
        where: { applicationId },
        select: { id: true },
      });
      const imageIds = images.map((img) => img.id);

      // Delete in dependency order
      if (imageIds.length > 0) {
        await tx.ocrResult.deleteMany({ where: { imageId: { in: imageIds } } });
      }
      await tx.comparison.deleteMany({ where: { applicationId } });
      await tx.auditEvent.deleteMany({ where: { applicationId } });
      await tx.review.deleteMany({ where: { applicationId } });
      await tx.labelImage.deleteMany({ where: { applicationId } });
      await tx.application.delete({ where: { id: applicationId } });
    });

    return { success: true };
  } catch (error) {
    console.error('[Admin] Delete application failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete application' };
  }
}

export async function resetDemoData(secret: string): Promise<ResetDemoResult> {
  // 1. Verify the user is authenticated
  const session = await verifySession();
  const agentName = session.agentName;

  // 2. Verify the secret matches DEMO_RESET_SECRET
  const expectedSecret = process.env.DEMO_RESET_SECRET;

  if (!expectedSecret) {
    console.error('[Admin] DEMO_RESET_SECRET environment variable is not set');
    return {
      success: false,
      error: 'Demo reset is not configured. Contact administrator.'
    };
  }

  if (!secret || secret !== expectedSecret) {
    console.warn(`[Admin] Invalid demo reset secret attempt by agent: ${agentName}`);
    return {
      success: false,
      error: 'Invalid secret. Please check your secret and try again.'
    };
  }

  console.log(`[Admin] Demo reset initiated by agent: ${agentName}`);

  try {
    // 3-7. Perform the reset in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete all AuditEvent records
      const deletedAuditEvents = await tx.auditEvent.deleteMany();

      // Delete all Review records
      const deletedReviews = await tx.review.deleteMany();

      // Delete all Comparison records
      const deletedComparisons = await tx.comparison.deleteMany();

      // Delete all OcrResult records
      const deletedOcrResults = await tx.ocrResult.deleteMany();

      // Reset Application statuses
      // Applications that should be NEEDS_ATTENTION (based on seed data categories)
      // These are applications with issues: mismatches, warning issues, producer mismatches, OCR challenges
      // We reset them to their appropriate initial status based on their data

      // First, reset all to READY
      const resetApplications = await tx.application.updateMany({
        data: { status: 'READY' },
      });

      // Then, set applications that should need attention based on their data:
      // - Missing government warning
      // - Altered government warning (not exact match to standard text)
      // We can identify these by checking if they have empty or non-standard government warnings
      const standardWarning = "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.";

      // Find applications that should be flagged as NEEDS_ATTENTION
      // For demo purposes, we'll flag applications with:
      // - Empty government warning
      // - Non-standard government warning
      await tx.application.updateMany({
        where: {
          OR: [
            { governmentWarning: '' },
            { governmentWarning: null },
          ],
        },
        data: { status: 'NEEDS_ATTENTION' },
      });

      // Also flag applications with non-standard warning text
      // (government warning that doesn't start with "GOVERNMENT WARNING:" in caps)
      await tx.application.updateMany({
        where: {
          AND: [
            { governmentWarning: { not: null } },
            { governmentWarning: { not: '' } },
            { governmentWarning: { not: standardWarning } },
          ],
        },
        data: { status: 'NEEDS_ATTENTION' },
      });

      return {
        auditEvents: deletedAuditEvents.count,
        reviews: deletedReviews.count,
        comparisons: deletedComparisons.count,
        ocrResults: deletedOcrResults.count,
        applicationsReset: resetApplications.count,
      };
    });

    console.log(`[Admin] Demo reset completed by agent: ${agentName}`, result);

    return {
      success: true,
      message: 'Demo data has been reset successfully.',
      deletedCounts: result,
    };
  } catch (error) {
    console.error('[Admin] Demo reset failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset demo data',
    };
  }
}
