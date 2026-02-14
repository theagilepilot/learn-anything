"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Module } from "@/lib/types";

const statusConfig = {
  not_started: { label: "Not Started", variant: "secondary" as const },
  in_progress: { label: "In Progress", variant: "default" as const },
  completed: { label: "Completed", variant: "outline" as const },
};

export function ModuleCard({
  module,
  syllabusId,
  index,
}: {
  module: Module;
  syllabusId: string;
  index: number;
}) {
  const status = statusConfig[module.status];

  return (
    <Link href={`/dashboard/syllabus/${syllabusId}/module/${module.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">
              <span className="text-muted-foreground mr-2">{index + 1}.</span>
              {module.title}
            </CardTitle>
            <Badge variant={status.variant} className="shrink-0">
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{module.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
