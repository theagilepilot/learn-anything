# Architecture

This is a Next.js 16 application using the App Router. The system is built around a content generation pipeline and a learning dashboard.

## High-level components

- UI: React components under src/components and route segments under src/app.
- API routes: Next.js route handlers under src/app/api for lesson, quiz, and syllabus generation.
- AI integration: Claude client and prompt builders in src/lib/claude.
- Data layer: Supabase clients in src/lib/supabase for server, middleware, and browser usage.
- Types and constants: Shared types and learning-style config in src/lib.

## Request flow

1. User selects a topic and learning style in the dashboard UI.
2. The app calls the Next.js API routes to generate a syllabus, lessons, and quizzes.
3. Route handlers assemble prompts, call Claude, parse responses, and return structured results.
4. The dashboard renders lesson content and quizzes, storing progress via Supabase.

## Rendering and content

- Lessons are authored in Markdown and rendered in the browser.
- For visual learning style, Mermaid code blocks are rendered into diagrams on the client.

## Auth and session

- Supabase auth is used for login/signup and session management.
- Middleware updates sessions and guards authenticated routes.

## Deployment

- Containerized build using Next.js standalone output for Cloud Run.
- CI/CD via GitHub Actions builds and deploys to Google Cloud Run.
- Runtime secrets are provided via Secret Manager and injected at deploy time.
