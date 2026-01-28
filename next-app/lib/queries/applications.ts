import prisma from "@/lib/prisma";
import type { ApplicationWhereInput } from "@/app/generated/prisma/models/Application";

// Application status type matching the database values
export type ApplicationStatus =
  | "PENDING"
  | "PROCESSING"
  | "READY"
  | "NEEDS_ATTENTION"
  | "REVIEWED"
  | "ERROR";

// Priority order for sorting - lower number = higher priority
const STATUS_PRIORITY: Record<ApplicationStatus, number> = {
  NEEDS_ATTENTION: 1,
  READY: 2,
  PROCESSING: 3,
  PENDING: 4,
  ERROR: 5,
  REVIEWED: 6,
};

// Type for application data returned from queries
export type ApplicationForQueue = {
  id: string;
  colaId: string | null;
  brandName: string;
  classType: string | null;
  status: string;
  createdAt: Date;
  reviewedBy: string | null;
};

// Filter parameters for queue queries
export type QueueFilters = {
  status?: string[];
  classType?: string[];
  search?: string;
  ids?: string[];
};

/**
 * Build a Prisma where clause from filter parameters
 */
function buildWhereClause(filters: QueueFilters): ApplicationWhereInput {
  const where: ApplicationWhereInput = {};
  const conditions: ApplicationWhereInput[] = [];

  // Filter by status (multi-select)
  if (filters.status && filters.status.length > 0) {
    conditions.push({
      status: { in: filters.status },
    });
  }

  // Filter by class type (multi-select)
  if (filters.classType && filters.classType.length > 0) {
    conditions.push({
      classType: { in: filters.classType },
    });
  }

  // Filter by specific application IDs
  if (filters.ids && filters.ids.length > 0) {
    conditions.push({
      id: { in: filters.ids },
    });
  }

  // Search by brand name or COLA ID
  // Note: SQL Server default collation is typically case-insensitive for NVARCHAR
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    conditions.push({
      OR: [
        { brandName: { contains: searchTerm } },
        { colaId: { contains: searchTerm } },
      ],
    });
  }

  // Combine all conditions with AND
  if (conditions.length > 0) {
    where.AND = conditions;
  }

  return where;
}

/**
 * Fetch applications for the queue with priority sorting and optional filters.
 * Default sort: NEEDS_ATTENTION first, then oldest READY items, etc.
 */
export async function getApplicationsForQueue(
  filters: QueueFilters = {}
): Promise<ApplicationForQueue[]> {
  const where = buildWhereClause(filters);

  const applications = await prisma.application.findMany({
    where,
    select: {
      id: true,
      colaId: true,
      brandName: true,
      classType: true,
      status: true,
      createdAt: true,
      reviews: {
        orderBy: { reviewedAt: "desc" },
        take: 1,
        select: {
          agentName: true,
        },
      },
    },
  });

  const queueItems: ApplicationForQueue[] = applications.map((app) => ({
    id: app.id,
    colaId: app.colaId,
    brandName: app.brandName,
    classType: app.classType,
    status: app.status,
    createdAt: app.createdAt,
    reviewedBy: app.reviews[0]?.agentName ?? null,
  }));

  // Sort by status priority, then by createdAt (oldest first within same status)
  return queueItems.sort((a, b) => {
    const priorityA = STATUS_PRIORITY[a.status as ApplicationStatus] ?? 99;
    const priorityB = STATUS_PRIORITY[b.status as ApplicationStatus] ?? 99;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Within same priority, oldest first
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

/**
 * Get the next application to review (highest priority).
 * Returns the first NEEDS_ATTENTION item, or oldest READY item.
 */
export async function getNextApplicationToReview(): Promise<ApplicationForQueue | null> {
  const applications = await getApplicationsForQueue();

  // Filter to only reviewable statuses
  const reviewable = applications.filter(
    (app) => app.status === "NEEDS_ATTENTION" || app.status === "READY"
  );

  return reviewable[0] ?? null;
}

/**
 * Get a single application by ID
 */
export async function getApplicationById(id: string) {
  return prisma.application.findUnique({
    where: { id },
  });
}

/**
 * Get facet counts for filters.
 * Each facet's counts are filtered by the OTHER facets, not itself.
 * This gives "what would I get if I select this" behavior.
 */
export async function getQueueFacetCounts(filters: QueueFilters = {}): Promise<{
  statusCounts: Record<string, number>;
  classTypeCounts: Record<string, number>;
}> {
  // For status counts: apply classType and search filters (but not status)
  const statusWhere = buildWhereClause({
    classType: filters.classType,
    search: filters.search,
  });

  // For classType counts: apply status and search filters (but not classType)
  const classTypeWhere = buildWhereClause({
    status: filters.status,
    search: filters.search,
  });

  const [statusApps, classTypeApps] = await Promise.all([
    prisma.application.findMany({
      where: statusWhere,
      select: { status: true },
    }),
    prisma.application.findMany({
      where: classTypeWhere,
      select: { classType: true },
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const app of statusApps) {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  }

  const classTypeCounts: Record<string, number> = {};
  for (const app of classTypeApps) {
    if (app.classType) {
      classTypeCounts[app.classType] = (classTypeCounts[app.classType] || 0) + 1;
    }
  }

  return { statusCounts, classTypeCounts };
}
