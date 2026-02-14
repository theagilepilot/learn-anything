import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClaudeClient } from "@/lib/claude/client";
import { gradeShortAnswerPrompt } from "@/lib/claude/prompts";
import { parseJSONResponse } from "@/lib/claude/parsers";
import {
  MODELS,
  QUIZ_PASS_THRESHOLD,
  ADAPTATION_THRESHOLD,
  ADAPTATION_WINDOW,
  STYLE_ROTATION,
} from "@/lib/constants";
import { SubmitQuizRequest, QuizAnswer, LearningStyle } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SubmitQuizRequest = await request.json();
    const { moduleId, syllabusId, questions, answers: rawAnswers } = body;

    if (!moduleId || !syllabusId || !questions || !rawAnswers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Grade each answer
    const claude = getClaudeClient();
    const gradedAnswers: QuizAnswer[] = [];

    for (const question of questions) {
      const studentAnswer = rawAnswers.find(
        (a) => a.question_id === question.id
      );
      const answerText = studentAnswer?.answer || "";

      if (question.type === "mcq") {
        // Exact match for MCQ
        gradedAnswers.push({
          question_id: question.id,
          answer: answerText,
          is_correct: answerText === question.correct_answer,
        });
      } else {
        // Use Claude Haiku to grade short answers
        if (!answerText.trim()) {
          gradedAnswers.push({
            question_id: question.id,
            answer: answerText,
            is_correct: false,
            explanation: "No answer provided",
          });
          continue;
        }

        const message = await claude.messages.create({
          model: MODELS.grading,
          max_tokens: 256,
          messages: [
            {
              role: "user",
              content: gradeShortAnswerPrompt(
                question.question,
                question.correct_answer,
                answerText
              ),
            },
          ],
        });

        const responseText =
          message.content[0].type === "text" ? message.content[0].text : "";
        const gradeResult = parseJSONResponse<{
          is_correct: boolean;
          explanation: string;
        }>(responseText);

        gradedAnswers.push({
          question_id: question.id,
          answer: answerText,
          is_correct: gradeResult.is_correct,
          explanation: gradeResult.explanation,
        });
      }
    }

    // Calculate score
    const correctCount = gradedAnswers.filter((a) => a.is_correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= QUIZ_PASS_THRESHOLD;

    // Save quiz attempt
    await supabase.from("quiz_attempts").insert({
      module_id: moduleId,
      syllabus_id: syllabusId,
      user_id: user.id,
      questions,
      answers: gradedAnswers,
      score,
      passed,
    });

    // Update module status if passed
    if (passed) {
      await supabase
        .from("modules")
        .update({ status: "completed" })
        .eq("id", moduleId)
        .eq("user_id", user.id);
    }

    // Check for learning style adaptation
    let styleChanged = false;
    let newStyle: string | undefined;

    const { data: recentAttempts } = await supabase
      .from("quiz_attempts")
      .select("score")
      .eq("syllabus_id", syllabusId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(ADAPTATION_WINDOW);

    if (recentAttempts && recentAttempts.length >= ADAPTATION_WINDOW) {
      const avgScore =
        recentAttempts.reduce((sum, a) => sum + a.score, 0) /
        recentAttempts.length;

      if (avgScore < ADAPTATION_THRESHOLD) {
        // Get current syllabus style
        const { data: syllabus } = await supabase
          .from("syllabi")
          .select("current_learning_style")
          .eq("id", syllabusId)
          .single();

        if (syllabus) {
          const currentIndex = STYLE_ROTATION.indexOf(
            syllabus.current_learning_style as LearningStyle
          );
          const nextStyle =
            STYLE_ROTATION[(currentIndex + 1) % STYLE_ROTATION.length];

          // Update syllabus style
          await supabase
            .from("syllabi")
            .update({ current_learning_style: nextStyle })
            .eq("id", syllabusId);

          // Log the event
          await supabase.from("learning_style_events").insert({
            syllabus_id: syllabusId,
            user_id: user.id,
            previous_style: syllabus.current_learning_style,
            new_style: nextStyle,
            trigger_score: avgScore,
          });

          styleChanged = true;
          newStyle = nextStyle;
        }
      }
    }

    return NextResponse.json({
      answers: gradedAnswers,
      score,
      passed,
      styleChanged,
      newStyle,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
