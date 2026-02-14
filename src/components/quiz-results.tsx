"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuizQuestion, QuizAnswer } from "@/lib/types";
import { QUIZ_PASS_THRESHOLD } from "@/lib/constants";

export function QuizResults({
  questions,
  answers,
  score,
  passed,
  styleChanged,
  newStyle,
}: {
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  score: number;
  passed: boolean;
  styleChanged?: boolean;
  newStyle?: string;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quiz Results</span>
            <Badge variant={passed ? "default" : "destructive"}>
              {score}% — {passed ? "Passed" : "Not Passed"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {passed
              ? "Congratulations! You've passed this module's quiz."
              : `You need ${QUIZ_PASS_THRESHOLD}% to pass. Review the lesson and try again.`}
          </p>
          {styleChanged && newStyle && (
            <div className="mt-3 rounded-md bg-blue-50 dark:bg-blue-950 p-3 text-sm">
              Your learning style has been adapted to <strong>{newStyle}</strong> based
              on your recent performance. Future lessons will adjust accordingly.
            </div>
          )}
        </CardContent>
      </Card>

      {questions.map((q, i) => {
        const answer = answers.find((a) => a.question_id === q.id);
        return (
          <Card key={q.id} className={answer?.is_correct ? "border-green-200" : "border-red-200"}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">
                  {q.id}. {q.question}
                </p>
                <Badge variant={answer?.is_correct ? "default" : "destructive"} className="shrink-0">
                  {answer?.is_correct ? "Correct" : "Incorrect"}
                </Badge>
              </div>
              <p className="text-sm">
                <span className="text-muted-foreground">Your answer: </span>
                {answer?.answer || "(no answer)"}
              </p>
              {!answer?.is_correct && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Correct answer: </span>
                  {q.correct_answer}
                </p>
              )}
              {answer?.explanation && (
                <p className="text-sm text-muted-foreground italic">
                  {answer.explanation}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
