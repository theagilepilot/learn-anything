import { describe, expect, it } from "vitest";
import { parseJSONResponse } from "@/lib/claude/parsers";

describe("parseJSONResponse", () => {
  it("parses raw JSON", () => {
    const result = parseJSONResponse<{ ok: boolean }>("{\"ok\":true}");
    expect(result).toEqual({ ok: true });
  });

  it("parses JSON from fenced code block", () => {
    const input = "```json\n{\"value\":42}\n```";
    const result = parseJSONResponse<{ value: number }>(input);
    expect(result.value).toBe(42);
  });

  it("parses JSON embedded in text", () => {
    const input = "Here is the data: {\"items\":[1,2,3]} Thanks!";
    const result = parseJSONResponse<{ items: number[] }>(input);
    expect(result.items).toEqual([1, 2, 3]);
  });
});
