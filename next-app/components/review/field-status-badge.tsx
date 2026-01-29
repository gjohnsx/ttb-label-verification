import { cn } from "@/lib/utils";
import type { MatchStatus, ConfidenceLevel } from "@/lib/comparison/types";
import { CheckIcon, AlertTriangleIcon, XIcon, HelpCircleIcon, InfoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type FieldStatusBadgeProps = {
  status: MatchStatus;
  showLabel?: boolean;
  className?: string;
};

const STATUS_CONFIG: Record<
  MatchStatus,
  {
    icon: React.ElementType;
    label: string;
    symbol: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  }
> = {
  MATCH: {
    icon: CheckIcon,
    label: "Match",
    symbol: "\u2713",
    bgClass: "bg-treasury-secondary-lightest",
    textClass: "text-treasury-secondary-dark",
    borderClass: "border-treasury-secondary",
  },
  LIKELY_MATCH: {
    icon: AlertTriangleIcon,
    label: "Likely Match",
    symbol: "~",
    bgClass: "bg-treasury-accent-lightest",
    textClass: "text-treasury-accent-dark",
    borderClass: "border-treasury-accent",
  },
  MISMATCH: {
    icon: XIcon,
    label: "Mismatch",
    symbol: "\u2717",
    bgClass: "bg-treasury-warning-lightest",
    textClass: "text-treasury-warning-dark",
    borderClass: "border-treasury-warning",
  },
  MISSING: {
    icon: HelpCircleIcon,
    label: "Missing",
    symbol: "?",
    bgClass: "bg-treasury-base-lightest",
    textClass: "text-treasury-base-dark",
    borderClass: "border-treasury-base",
  },
  CONTEXT: {
    icon: InfoIcon,
    label: "Context",
    symbol: "i",
    bgClass: "bg-treasury-primary-lightest",
    textClass: "text-treasury-primary-dark",
    borderClass: "border-treasury-primary",
  },
};

export function FieldStatusBadge({
  status,
  showLabel = true,
  className,
}: FieldStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const badge = (
    <Badge
      className={cn(
        config.bgClass,
        config.textClass,
        config.borderClass,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );

  if (status !== "CONTEXT") {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px]">
        <p className="text-xs leading-snug">
          Context-only field. It comes from the application but isn’t required
          to appear on the label, so it doesn’t affect approval.
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

type ConfidenceChipProps = {
  confidence: ConfidenceLevel;
  className?: string;
};

const CONFIDENCE_CONFIG: Record<
  ConfidenceLevel,
  { label: string; className: string }
> = {
  HIGH: {
    label: "HIGH",
    className: "text-treasury-secondary-dark",
  },
  MEDIUM: {
    label: "MED",
    className: "text-treasury-accent-dark",
  },
  LOW: {
    label: "LOW",
    className: "text-treasury-base-dark",
  },
};

export function ConfidenceChip({ confidence, className }: ConfidenceChipProps) {
  const config = CONFIDENCE_CONFIG[confidence];

  return (
    <span
      className={cn(
        "text-[10px] font-medium uppercase tracking-wide",
        config.className,
        className
      )}
      title={`Confidence: ${confidence}`}
    >
      {config.label}
    </span>
  );
}
