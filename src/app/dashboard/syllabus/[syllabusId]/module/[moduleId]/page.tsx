"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonContent } from "@/components/lesson-content";

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const syllabusId = params.syllabusId as string;
  const moduleId = params.moduleId as string;

  const [content, setContent] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLesson() {
      try {
        const res = await fetch("/api/lesson/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load lesson");
        }

        const data = await res.json();
        setContent(data.content);
        setModuleTitle(data.moduleTitle || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [moduleId]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/syllabus/${syllabusId}`}
          className="hover:underline"
        >
          Syllabus
        </Link>
        <span>/</span>
        <span>{moduleTitle || "Module"}</span>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="pt-4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <p className="text-sm text-muted-foreground text-center pt-4">
            Generating lesson content... This may take 10-15 seconds.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      ) : (
        <>
          <LessonContent content={content || ""} />
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/syllabus/${syllabusId}`}>
                Back to Syllabus
              </Link>
            </Button>
            <Button
              onClick={() =>
                router.push(
                  `/dashboard/syllabus/${syllabusId}/module/${moduleId}/quiz`
                )
              }
            >
              Take Quiz
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
