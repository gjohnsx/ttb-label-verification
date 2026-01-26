'use server';

import { verifySession } from '@/lib/dal';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Verdict types that the UI sends
export type UIVerdict = 'APPROVED' | 'REJECTED' | 'REQUEST_IMAGE';

// Review verdicts stored in the database
export type ReviewVerdict = 'APPROVED' | 'REJECTED' | 'OVERRIDE';

// Map UI verdicts to database verdicts
function mapVerdictToDb(verdict: UIVerdict): ReviewVerdict {
  switch (verdict) {
    case 'APPROVED':
      return 'APPROVED';
    case 'REJECTED':
      return 'REJECTED';
    case 'REQUEST_IMAGE':
      // REQUEST_IMAGE is treated as a rejection that needs better images
      return 'REJECTED';
    default:
      throw new Error(`Invalid verdict: ${verdict}`);
  }
}

// Validate that verdict is one of the allowed values
function isValidVerdict(verdict: string): verdict is UIVerdict {
  return ['APPROVED', 'REJECTED', 'REQUEST_IMAGE'].includes(verdict);
}

// Sanitize notes field - trim and limit length
function sanitizeNotes(notes?: string): string | null {
  if (!notes) return null;
  const trimmed = notes.trim();
  if (trimmed.length === 0) return null;
  // Limit to 4000 characters (fits in SQL Server nvarchar(max) easily)
  return trimmed.slice(0, 4000);
}

// Maximum length for reason codes
const MAX_REASON_CODE_LENGTH = 50;

// Sanitize reason code
function sanitizeReasonCode(reasonCode?: string): string | null {
  if (!reasonCode) return null;
  const trimmed = reasonCode.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, MAX_REASON_CODE_LENGTH);
}

export type SubmitReviewResult =
  | { success: true; reviewId: string }
  | { success: false; error: string };

/**
 * Submit a review verdict for an application
 *
 * This Server Action:
 * 1. Verifies the agent session
 * 2. Creates a Review record
 * 3. Updates the Application status to REVIEWED
 * 4. Creates an AuditEvent for the review
 * 5. Revalidates relevant paths
 * 6. Redirects to the queue
 */
export async function submitReview(
  applicationId: string,
  verdict: UIVerdict,
  reasonCode?: string,
  notes?: string
): Promise<SubmitReviewResult> {
  // 1. Verify session - this redirects to login if not authenticated
  const session = await verifySession();
  const agentName = session.agentName;

  // 2. Validate inputs
  if (!applicationId || typeof applicationId !== 'string') {
    return { success: false, error: 'Invalid application ID' };
  }

  if (!isValidVerdict(verdict)) {
    return { success: false, error: `Invalid verdict: ${verdict}` };
  }

  // 3. Sanitize inputs
  const sanitizedNotes = sanitizeNotes(notes);
  const sanitizedReasonCode = sanitizeReasonCode(reasonCode);
  const dbVerdict = mapVerdictToDb(verdict);

  try {
    // 4. Fetch the application with its comparison to get original AI verdict
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        comparisons: {
          orderBy: { computedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!application) {
      return { success: false, error: 'Application not found' };
    }

    // Get the original AI verdict from the most recent comparison
    const originalAiVerdict = application.comparisons[0]?.overallStatus || null;

    // 5. Use transaction to create review, update application status, and create audit event
    const result = await prisma.$transaction(async (tx) => {
      // Create the Review record
      const review = await tx.review.create({
        data: {
          applicationId,
          agentName,
          verdict: dbVerdict,
          reasonCode: sanitizedReasonCode,
          notes: sanitizedNotes,
          originalAiVerdict,
        },
      });

      // Update the Application status to REVIEWED
      await tx.application.update({
        where: { id: applicationId },
        data: { status: 'REVIEWED' },
      });

      // Create AuditEvent record
      await tx.auditEvent.create({
        data: {
          applicationId,
          agentName,
          eventType: 'REVIEW_SUBMITTED',
          eventData: JSON.stringify({
            verdict: dbVerdict,
            uiVerdict: verdict, // Store the original UI verdict for context
            reasonCode: sanitizedReasonCode,
            notes: sanitizedNotes,
            originalAiVerdict,
            reviewId: review.id,
          }),
        },
      });

      return review;
    });

    // 6. Revalidate paths to update UI
    revalidatePath('/queue');
    revalidatePath(`/review/${applicationId}`);

    // Return success before redirect
    return { success: true, reviewId: result.id };
  } catch (error) {
    console.error('Error submitting review:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit review'
    };
  }
}

/**
 * Submit review and redirect to queue
 * This is a separate action that performs the redirect after successful submission
 */
export async function submitReviewAndRedirect(
  applicationId: string,
  verdict: UIVerdict,
  reasonCode?: string,
  notes?: string
): Promise<void> {
  const result = await submitReview(applicationId, verdict, reasonCode, notes);

  if (!result.success) {
    // If there's an error, throw it so the client can handle it
    throw new Error(result.error);
  }

  // Redirect to queue after successful submission
  redirect('/queue');
}

/**
 * Get the next unreviewed application ID from the queue
 * Returns null if there are no more applications to review
 */
export async function getNextUnreviewedApplicationId(
  currentApplicationId?: string
): Promise<string | null> {
  // Verify session first
  await verifySession();

  const nextApplication = await prisma.application.findFirst({
    where: {
      status: {
        in: ['READY', 'NEEDS_ATTENTION'],
      },
      // Exclude current application if provided
      ...(currentApplicationId && {
        NOT: { id: currentApplicationId },
      }),
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  return nextApplication?.id || null;
}

/**
 * Submit review and redirect to next item or queue
 * If there's another item to review, redirects there; otherwise goes to queue
 */
export async function submitReviewAndContinue(
  applicationId: string,
  verdict: UIVerdict,
  reasonCode?: string,
  notes?: string
): Promise<void> {
  const result = await submitReview(applicationId, verdict, reasonCode, notes);

  if (!result.success) {
    throw new Error(result.error);
  }

  // Try to get the next unreviewed application
  const nextId = await getNextUnreviewedApplicationId(applicationId);

  if (nextId) {
    redirect(`/review/${nextId}`);
  } else {
    redirect('/queue');
  }
}
