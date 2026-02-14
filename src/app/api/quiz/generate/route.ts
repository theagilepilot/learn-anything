import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClaudeClient } from "@/lib/claude/client";
import { quizPrompt } from "@/lib/claude/prompts";
import { parseJSONResponse } from "@/lib/claude/parsers";
import { MODELS } from "@/lib/constants";
import { GenerateQuizRequest, QuizQuestion } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateQuizRequest = await request.json();
    const { moduleId } = body;

    if (!moduleId) {
      return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
    }

    const { data: module, error: moduleError } = await supabase
      .from("modules")
      .select("*, syllabi(*)")
      .eq("id", moduleId)
      .eq("user_id", user.id)
      .single();

    if (moduleError || !module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    if (!module.lesson_content) {
      return NextResponse.json(
        { error: "Lesson content must be generated before taking a quiz" },
        { status: 400 }
      );
    }

    const syllabus = module.syllabi;
    const claude = getClaudeClient();
    const message = await claude.messages.create({
      model: MODELS.content,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: quizPrompt(
            module.lesson_content,
            module.title,
            syllabus.current_learning_style
          ),
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const questions = parseJSONResponse<QuizQuestion[]>(responseText);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
