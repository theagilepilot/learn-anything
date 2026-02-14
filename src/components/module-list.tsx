import { Module } from "@/lib/types";
import { ModuleCard } from "./module-card";

export function ModuleList({
  modules,
  syllabusId,
}: {
  modules: Module[];
  syllabusId: string;
}) {
  const sorted = [...modules].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-3">
      {sorted.map((module, index) => (
        <ModuleCard
          key={module.id}
          module={module}
          syllabusId={syllabusId}
          index={index}
        />
      ))}
    </div>
  );
}
