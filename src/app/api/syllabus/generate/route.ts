import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClaudeClient } from "@/lib/claude/client";
import { syllabusPrompt } from "@/lib/claude/prompts";
import { parseJSONResponse } from "@/lib/claude/parsers";
import { MODELS } from "@/lib/constants";
import { GenerateSyllabusRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateSyllabusRequest = await request.json();
    const { topic, duration, learning_style } = body;

    if (!topic || !duration || !learning_style) {
      return NextResponse.json(
        { error: "Topic, duration, and learning_style are required" },
        { status: 400 }
      );
    }

    const claude = getClaudeClient();
    const message = await claude.messages.create({
      model: MODELS.content,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: syllabusPrompt(topic, duration, learning_style),
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const modules = parseJSONResponse<
      { title: string; description: string; objectives: string[] }[]
    >(responseText);

    // Insert syllabus
    const { data: syllabus, error: syllabusError } = await supabase
      .from("syllabi")
      .insert({
        user_id: user.id,
        topic,
        duration,
        learning_style,
        current_learning_style: learning_style,
        module_count: modules.length,
      })
      .select()
      .single();

    if (syllabusError) {
      return NextResponse.json({ error: syllabusError.message }, { status: 500 });
    }

    // Insert modules
    const moduleInserts = modules.map((m, index) => ({
      syllabus_id: syllabus.id,
      user_id: user.id,
      title: m.title,
      description: m.description,
      objectives: m.objectives,
      order_index: index,
      status: "not_started",
    }));

    const { error: modulesError } = await supabase
      .from("modules")
      .insert(moduleInserts);

    if (modulesError) {
      return NextResponse.json({ error: modulesError.message }, { status: 500 });
    }

    return NextResponse.json({ syllabusId: syllabus.id });
  } catch (error) {
    console.error("Syllabus generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate syllabus" },
      { status: 500 }
    );
  }
}
