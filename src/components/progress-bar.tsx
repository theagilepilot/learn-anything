"use client";

import { Progress } from "@/components/ui/progress";

export function ProgressBar({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{completed} of {total} modules completed</span>
        <span>{percentage}%</span>
      </div>
      <Progress value={percentage} />
    </div>
  );
}
