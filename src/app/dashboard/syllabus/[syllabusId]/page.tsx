export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/progress-bar";
import { ModuleList } from "@/components/module-list";
import { Syllabus, Module } from "@/lib/types";

export default async function SyllabusPage({
  params,
}: {
  params: Promise<{ syllabusId: string }>;
}) {
  const { syllabusId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: syllabus } = await supabase
    .from("syllabi")
    .select("*")
    .eq("id", syllabusId)
    .eq("user_id", user!.id)
    .single();

  if (!syllabus) {
    notFound();
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("syllabus_id", syllabusId)
    .order("order_index", { ascending: true });

  const typedSyllabus = syllabus as Syllabus;
  const typedModules = (modules || []) as Module[];
  const completed = typedModules.filter((m) => m.status === "completed").length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <span>/</span>
        <span>{typedSyllabus.topic}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{typedSyllabus.topic}</h1>
          <div className="flex gap-2 shrink-0">
            <Badge variant="outline">{typedSyllabus.duration}</Badge>
            <Badge variant="secondary">{typedSyllabus.current_learning_style}</Badge>
          </div>
        </div>
        {typedSyllabus.current_learning_style !== typedSyllabus.learning_style && (
          <p className="text-sm text-muted-foreground">
            Originally {typedSyllabus.learning_style} — adapted to{" "}
            {typedSyllabus.current_learning_style}
          </p>
        )}
        <ProgressBar completed={completed} total={typedModules.length} />
      </div>

      <ModuleList modules={typedModules} syllabusId={syllabusId} />

      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
