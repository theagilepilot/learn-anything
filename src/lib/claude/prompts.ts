import { LearningStyle } from "../types";

export function syllabusPrompt(topic: string, duration: string, style: LearningStyle): string {
  return `You are an expert curriculum designer. Create a structured syllabus for learning "${topic}" over ${duration}.

The learner prefers a "${style}" learning style:
- visual: Include diagrams descriptions, charts, infographics, and visual metaphors
- mixed: Balance text explanations with visual aids and practical exercises
- reading_writing: Focus on detailed text explanations, definitions, and written exercises
- hands_on: Focus on practical projects, coding exercises, and real-world applications

Generate a JSON array of modules. Each module should have:
- title: A clear, descriptive title
- description: 2-3 sentences describing what will be covered
- objectives: An array of 3-4 specific learning objectives

The number of modules should be appropriate for the duration:
- 1 week: 5-7 modules
- 2 weeks: 8-12 modules
- 1 month: 12-16 modules
- 3 months: 20-25 modules

Respond with ONLY a valid JSON array, no markdown formatting or code blocks. Example format:
[
  {
    "title": "Module Title",
    "description": "Description of the module content.",
    "objectives": ["Objective 1", "Objective 2", "Objective 3"]
  }
]`;
}

export function lessonPrompt(
  moduleTitle: string,
  moduleDescription: string,
  objectives: string[],
  topic: string,
  style: LearningStyle
): string {
  return `You are an expert teacher. Create a comprehensive lesson for the following module:

Topic: ${topic}
Module: ${moduleTitle}
Description: ${moduleDescription}
Learning Objectives:
${objectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}

Learning Style: ${style}
${styleInstructions(style)}

Write the lesson in Markdown format. Include:
1. An introduction to the topic
2. Detailed explanations for each learning objective
3. Examples and illustrations appropriate for the learning style
4. A brief summary at the end

Use proper Markdown formatting with headers (##, ###), bold text, bullet points, and code blocks where appropriate. Make the content engaging and thorough (aim for 800-1500 words).`;
}

export function quizPrompt(
  lessonContent: string,
  moduleTitle: string,
  style: LearningStyle
): string {
  return `You are an expert quiz creator. Based on the following lesson content, create a quiz with exactly 5 questions: 3 multiple-choice questions and 2 short-answer questions.

Module: ${moduleTitle}
Learning Style: ${style}

Lesson Content:
${lessonContent}

Respond with ONLY a valid JSON array. Each question should have:
- id: number (1-5)
- type: "mcq" or "short_answer"
- question: the question text
- options: array of 4 options (only for MCQ questions)
- correct_answer: the correct answer text (for MCQ, must match one of the options exactly)

The first 3 should be MCQ, the last 2 should be short_answer.

Example format:
[
  {
    "id": 1,
    "type": "mcq",
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A"
  },
  {
    "id": 4,
    "type": "short_answer",
    "question": "Explain...",
    "correct_answer": "A brief correct answer for grading reference"
  }
]`;
}

export function gradeShortAnswerPrompt(
  question: string,
  correctAnswer: string,
  studentAnswer: string
): string {
  return `You are a fair and encouraging teacher grading a student's short answer.

Question: ${question}
Reference Answer: ${correctAnswer}
Student's Answer: ${studentAnswer}

Evaluate if the student's answer demonstrates understanding of the concept. Be lenient - the answer doesn't need to be word-for-word, just conceptually correct.

Respond with ONLY a valid JSON object:
{
  "is_correct": true or false,
  "explanation": "Brief explanation of why the answer is correct or what was missing"
}`;
}

function styleInstructions(style: LearningStyle): string {
  switch (style) {
    case "visual":
      return "Adapt for VISUAL learners: Use Mermaid diagrams in fenced code blocks (```mermaid), describe charts/flowcharts, use analogies and visual metaphors. Format information in tables where possible.";
    case "mixed":
      return "Adapt for MIXED learners: Balance text explanations with visual descriptions, practical examples, and structured summaries.";
    case "reading_writing":
      return "Adapt for READING/WRITING learners: Use detailed text explanations, definitions, lists, and written summaries. Include key terminology and written exercises.";
    case "hands_on":
      return "Adapt for HANDS-ON learners: Include practical code examples, step-by-step tutorials, mini-projects, and real-world applications. Show code you can run.";
  }
}
