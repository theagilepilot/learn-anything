"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LEARNING_STYLES, DURATIONS } from "@/lib/constants";
import { LearningStyle } from "@/lib/types";

export function TopicForm() {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("");
  const [learningStyle, setLearningStyle] = useState<LearningStyle | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic || !duration || !learningStyle) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/syllabus/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, duration, learning_style: learningStyle }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate syllabus");
      }

      const data = await res.json();
      router.push(`/dashboard/syllabus/${data.syllabusId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">What do you want to learn?</CardTitle>
        <CardDescription>
          Enter a topic and we&apos;ll create a personalized learning plan for you
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Python Programming, Machine Learning, Guitar..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Study Duration</Label>
            <Select value={duration} onValueChange={setDuration} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="How long do you want to study?" />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="style">Learning Style</Label>
            <Select
              value={learningStyle}
              onValueChange={(v) => setLearningStyle(v as LearningStyle)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="How do you learn best?" />
              </SelectTrigger>
              <SelectContent>
                {LEARNING_STYLES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label} — {s.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading || !topic || !duration || !learningStyle}>
            {loading ? "Generating your syllabus..." : "Generate Syllabus"}
          </Button>
          {loading && (
            <p className="text-sm text-muted-foreground text-center">
              This may take 10-15 seconds...
            </p>
          )}
        </CardContent>
      </form>
    </Card>
  );
}
