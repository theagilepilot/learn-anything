import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LessonContent } from "@/components/lesson-content";

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({
      svg: "<svg data-testid=\"mermaid-diagram\"></svg>",
    }),
  },
}));

describe("LessonContent", () => {
  it("renders mermaid code blocks as diagrams", async () => {
    const content = "```mermaid\nflowchart TD\nA-->B\n```";

    render(<LessonContent content={content} />);

    await waitFor(() => {
      expect(screen.getByTestId("mermaid-diagram")).toBeInTheDocument();
    });
  });
});
