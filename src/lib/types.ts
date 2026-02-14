export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface Syllabus {
  id: string;
  user_id: string;
  topic: string;
  duration: string;
  learning_style: LearningStyle;
  current_learning_style: LearningStyle;
  module_count: number;
  created_at: string;
  modules?: Module[];
}

export interface Module {
  id: string;
  syllabus_id: string;
  user_id: string;
  title: string;
  description: string;
  objectives: string[];
  lesson_content: string | null;
  status: ModuleStatus;
  order_index: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  module_id: string;
  syllabus_id: string;
  user_id: string;
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  score: number;
  passed: boolean;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  type: "mcq" | "short_answer";
  question: string;
  options?: string[];
  correct_answer: string;
}

export interface QuizAnswer {
  question_id: number;
  answer: string;
  is_correct: boolean;
  explanation?: string;
}

export interface LearningStyleEvent {
  id: string;
  syllabus_id: string;
  user_id: string;
  previous_style: LearningStyle;
  new_style: LearningStyle;
  trigger_score: number;
  created_at: string;
}

export type LearningStyle = "visual" | "mixed" | "reading_writing" | "hands_on";
export type ModuleStatus = "not_started" | "in_progress" | "completed";

export interface GenerateSyllabusRequest {
  topic: string;
  duration: string;
  learning_style: LearningStyle;
}

export interface GenerateLessonRequest {
  moduleId: string;
}

export interface GenerateQuizRequest {
  moduleId: string;
}

export interface SubmitQuizRequest {
  moduleId: string;
  syllabusId: string;
  questions: QuizQuestion[];
  answers: { question_id: number; answer: string }[];
}
