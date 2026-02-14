import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TopicForm } from "@/components/topic-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <span className="font-bold text-lg">LearnAnything</span>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <div className="text-center space-y-2 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">
            Learn anything, your way
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-powered personalized syllabi, interactive lessons, and adaptive
            quizzes. Pick a topic, choose your style, and start learning.
          </p>
        </div>

        {user ? (
          <TopicForm />
        ) : (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Sign in to create your personalized learning plan
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href="/signup">Get started</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
