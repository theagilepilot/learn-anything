import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClaudeClient } from "@/lib/claude/client";
import { lessonPrompt } from "@/lib/claude/prompts";
import { MODELS } from "@/lib/constants";
import { GenerateLessonRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateLessonRequest = await request.json();
    const { moduleId } = body;

    if (!moduleId) {
      return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
    }

    // Fetch module with syllabus info
    const { data: module, error: moduleError } = await supabase
      .from("modules")
      .select("*, syllabi(*)")
      .eq("id", moduleId)
      .eq("user_id", user.id)
      .single();

    if (moduleError || !module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Return cached content if it exists
    if (module.lesson_content) {
      return NextResponse.json({ content: module.lesson_content, moduleTitle: module.title });
    }

    const syllabus = module.syllabi;
    const claude = getClaudeClient();
    const message = await claude.messages.create({
      model: MODELS.content,
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: lessonPrompt(
            module.title,
            module.description,
            module.objectives,
            syllabus.topic,
            syllabus.current_learning_style
          ),
        },
      ],
    });

    const content =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Cache in DB and update status
    await supabase
      .from("modules")
      .update({
        lesson_content: content,
        status: module.status === "not_started" ? "in_progress" : module.status,
      })
      .eq("id", moduleId);

    return NextResponse.json({ content, moduleTitle: module.title });
  } catch (error) {
    console.error("Lesson generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate lesson" },
      { status: 500 }
    );
  }
}
