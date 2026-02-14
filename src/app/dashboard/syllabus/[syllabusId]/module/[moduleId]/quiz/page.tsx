"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizQuestion as QuizQuestionComponent } from "@/components/quiz-question";
import { QuizResults } from "@/components/quiz-results";
import { QuizQuestion, QuizAnswer } from "@/lib/types";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const syllabusId = params.syllabusId as string;
  const moduleId = params.moduleId as string;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    answers: QuizAnswer[];
    score: number;
    passed: boolean;
    styleChanged?: boolean;
    newStyle?: string;
  } | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch("/api/quiz/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to generate quiz");
        }

        const data = await res.json();
        setQuestions(data.questions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [moduleId]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const formattedAnswers = questions.map((q) => ({
        question_id: q.id,
        answer: answers[q.id] || "",
      }));

      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          syllabusId,
          questions,
          answers: formattedAnswers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit quiz");
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const allAnswered = questions.every((q) => answers[q.id]?.trim());

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
        <Link
          href={`/dashboard/syllabus/${syllabusId}/module/${moduleId}`}
          className="hover:underline"
        >
          Module
        </Link>
        <span>/</span>
        <span>Quiz</span>
      </div>

      <h1 className="text-2xl font-bold">Module Quiz</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <p className="text-sm text-muted-foreground text-center">
            Generating quiz questions...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      ) : results ? (
        <>
          <QuizResults
            questions={questions}
            answers={results.answers}
            score={results.score}
            passed={results.passed}
            styleChanged={results.styleChanged}
            newStyle={results.newStyle}
          />
          <div className="flex justify-between pt-4">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/syllabus/${syllabusId}/module/${moduleId}`}>
                Review Lesson
              </Link>
            </Button>
            {results.passed ? (
              <Button asChild>
                <Link href={`/dashboard/syllabus/${syllabusId}`}>
                  Back to Syllabus
                </Link>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setResults(null);
                  setAnswers({});
                  setLoading(true);
                  setError(null);
                  // Re-generate quiz
                  fetch("/api/quiz/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ moduleId }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      setQuestions(data.questions);
                      setLoading(false);
                    })
                    .catch((err) => {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Failed to load quiz"
                      );
                      setLoading(false);
                    });
                }}
              >
                Try Again
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            {questions.map((q) => (
              <QuizQuestionComponent
                key={q.id}
                question={q}
                answer={answers[q.id] || ""}
                onAnswer={(answer) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: answer }))
                }
                disabled={submitting}
              />
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/syllabus/${syllabusId}/module/${moduleId}`}>
                Back to Lesson
              </Link>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              {submitting ? "Grading..." : "Submit Quiz"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
