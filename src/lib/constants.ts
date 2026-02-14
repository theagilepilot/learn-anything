import { LearningStyle } from "./types";

export const LEARNING_STYLES: { value: LearningStyle; label: string; description: string }[] = [
  { value: "visual", label: "Visual", description: "Diagrams, charts, and visual explanations" },
  { value: "mixed", label: "Mixed", description: "A balanced blend of all learning approaches" },
  { value: "reading_writing", label: "Reading/Writing", description: "Text-heavy explanations and written exercises" },
  { value: "hands_on", label: "Hands-On", description: "Practical examples and coding exercises" },
];

export const DURATIONS = [
  { value: "1 week", label: "1 Week" },
  { value: "2 weeks", label: "2 Weeks" },
  { value: "1 month", label: "1 Month" },
  { value: "3 months", label: "3 Months" },
];

export const STYLE_ROTATION: LearningStyle[] = ["visual", "mixed", "reading_writing", "hands_on"];

export const QUIZ_PASS_THRESHOLD = 80;
export const ADAPTATION_THRESHOLD = 70;
export const ADAPTATION_WINDOW = 3;

export const MODELS = {
  content: "claude-sonnet-4-5-20250929" as const,
  grading: "claude-haiku-4-5-20251001" as const,
};
