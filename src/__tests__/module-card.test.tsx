import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModuleCard } from "@/components/module-card";
import type { Module } from "@/lib/types";

vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("ModuleCard", () => {
  it("renders module title and status", () => {
    const module: Module = {
      id: "module-1",
      syllabus_id: "syllabus-1",
      user_id: "user-1",
      title: "Intro to Systems",
      description: "Learn the basics.",
      objectives: ["Understand components"],
      lesson_content: null,
      status: "in_progress",
      order_index: 0,
      created_at: "2024-01-01T00:00:00.000Z",
    };

    render(<ModuleCard module={module} syllabusId="syllabus-1" index={0} />);

    expect(screen.getByText("Intro to Systems")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });
});
