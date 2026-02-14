"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizQuestion as QuizQuestionType } from "@/lib/types";

export function QuizQuestion({
  question,
  answer,
  onAnswer,
  disabled,
}: {
  question: QuizQuestionType;
  answer: string;
  onAnswer: (answer: string) => void;
  disabled: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Question {question.id}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({question.type === "mcq" ? "Multiple Choice" : "Short Answer"})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{question.question}</p>
        {question.type === "mcq" && question.options ? (
          <div className="space-y-2">
            {question.options.map((option, i) => (
              <label
                key={i}
                className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                  answer === option
                    ? "border-primary bg-primary/5"
                    : "hover:bg-accent/50"
                } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answer === option}
                  onChange={() => onAnswer(option)}
                  disabled={disabled}
                  className="accent-primary"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor={`answer-${question.id}`}>Your answer</Label>
            <Input
              id={`answer-${question.id}`}
              value={answer}
              onChange={(e) => onAnswer(e.target.value)}
              placeholder="Type your answer..."
              disabled={disabled}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
