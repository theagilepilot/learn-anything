import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "@/components/progress-bar";

describe("ProgressBar", () => {
  it("shows completed modules and percentage", () => {
    render(<ProgressBar completed={2} total={5} />);

    expect(screen.getByText("2 of 5 modules completed")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });
});
