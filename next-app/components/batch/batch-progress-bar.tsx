"use client";

import { Progress } from "@/components/ui/progress";

interface BatchProgressBarProps {
  completed: number;
  total: number;
}

export function BatchProgressBar({ completed, total }: BatchProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = completed === total;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-treasury-base-dark">
          {completed} of {total} complete
        </span>
        <span className="font-medium text-treasury-ink">{percentage}%</span>
      </div>
      <Progress
        value={percentage}
        className={`h-2 ${isComplete ? "bg-treasury-secondary-lightest" : "bg-treasury-base-lighter"}`}
      />
    </div>
  );
}
