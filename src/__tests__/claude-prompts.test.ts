import { describe, expect, it } from "vitest";
import { lessonPrompt } from "@/lib/claude/prompts";

describe("lessonPrompt", () => {
  it("includes Mermaid guidance for visual style", () => {
    const prompt = lessonPrompt("Title", "Desc", ["Obj"], "Topic", "visual");
    expect(prompt).toContain("```mermaid");
    expect(prompt).toContain("VISUAL learners");
  });
});
