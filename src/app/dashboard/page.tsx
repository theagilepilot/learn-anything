export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/progress-bar";
import { Syllabus, Module } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: syllabi } = await supabase
    .from("syllabi")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  // Fetch module counts per syllabus
  const syllabusIds = (syllabi || []).map((s: Syllabus) => s.id);
  let modulesMap: Record<string, Module[]> = {};

  if (syllabusIds.length > 0) {
    const { data: modules } = await supabase
      .from("modules")
      .select("*")
      .in("syllabus_id", syllabusIds);

    if (modules) {
      for (const m of modules as Module[]) {
        if (!modulesMap[m.syllabus_id]) modulesMap[m.syllabus_id] = [];
        modulesMap[m.syllabus_id].push(m);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Learning Plans</h1>
        <Button asChild>
          <Link href="/">New Syllabus</Link>
        </Button>
      </div>

      {!syllabi || syllabi.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t created any learning plans yet.
            </p>
            <Button asChild>
              <Link href="/">Create your first syllabus</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(syllabi as Syllabus[]).map((syllabus) => {
            const modules = modulesMap[syllabus.id] || [];
            const completed = modules.filter(
              (m) => m.status === "completed"
            ).length;

            return (
              <Link
                key={syllabus.id}
                href={`/dashboard/syllabus/${syllabus.id}`}
              >
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{syllabus.topic}</CardTitle>
                      <Badge variant="outline" className="shrink-0">
                        {syllabus.current_learning_style}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {syllabus.duration} &middot; {syllabus.module_count} modules
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ProgressBar completed={completed} total={modules.length} />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
