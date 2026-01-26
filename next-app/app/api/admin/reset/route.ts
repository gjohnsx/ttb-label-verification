import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/admin/reset
 *
 * Alternative API endpoint for resetting demo data.
 * Can be called programmatically or via curl for testing.
 *
 * Request body:
 * - secret: string (must match DEMO_RESET_SECRET env var)
 *
 * Response:
 * - 200: { success: true, message: string, deletedCounts: {...} }
 * - 401: { error: 'Unauthorized' }
 * - 500: { error: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret } = body;

    // Verify secret
    const expectedSecret = process.env.DEMO_RESET_SECRET;

    if (!expectedSecret) {
      console.error('[API Admin] DEMO_RESET_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'Demo reset is not configured' },
        { status: 500 }
      );
    }

    if (!secret || secret !== expectedSecret) {
      console.warn('[API Admin] Invalid demo reset secret attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[API Admin] Demo reset initiated via API');

    // Standard government warning for reference
    const standardWarning = "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.";

    // Perform reset in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete all user-generated data in reverse dependency order
      const deletedAuditEvents = await tx.auditEvent.deleteMany();
      const deletedReviews = await tx.review.deleteMany();
      const deletedComparisons = await tx.comparison.deleteMany();
      const deletedOcrResults = await tx.ocrResult.deleteMany();

      // Reset all applications to READY
      const resetApplications = await tx.application.updateMany({
        data: { status: 'READY' },
      });

      // Flag applications with missing or empty government warning as NEEDS_ATTENTION
      await tx.application.updateMany({
        where: {
          OR: [
            { governmentWarning: '' },
            { governmentWarning: null },
          ],
        },
        data: { status: 'NEEDS_ATTENTION' },
      });

      // Flag applications with non-standard warning text as NEEDS_ATTENTION
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

    console.log('[API Admin] Demo reset completed via API', result);

    return NextResponse.json({
      success: true,
      message: 'Demo data reset successfully',
      deletedCounts: result,
    });
  } catch (error) {
    console.error('[API Admin] Demo reset failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
