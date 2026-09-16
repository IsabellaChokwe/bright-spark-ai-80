import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, GraduationCap, ListChecks, Mail, Sparkles } from "lucide-react";
import { TaskPrioritizer } from "@/components/TaskPrioritizer";
import { EmailAssistant } from "@/components/EmailAssistant";
import { StudyPlanner } from "@/components/StudyPlanner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Productivity Assistant | Isabella Chokwe · CAPACITI ASA" },
      {
        name: "description",
        content:
          "Prioritize tasks, draft professional emails and generate a weekly study schedule — a student AI productivity dashboard by Isabella Chokwe.",
      },
      {
        property: "og:title",
        content: "AI Productivity Assistant | Isabella Chokwe · CAPACITI ASA",
      },
      {
        property: "og:description",
        content:
          "Three AI study tools in one dashboard: task prioritizer, email draft assistant and study planner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "tasks", label: "Task Prioritizer", icon: ListChecks },
  { id: "email", label: "Email Draft Assistant", icon: Mail },
  { id: "study", label: "Study Planner", icon: GraduationCap },
] as const;

function Index() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("tasks");

  return (
    <main className="min-h-screen bg-mesh pb-16">
      <header className="border-b border-border/60 bg-card/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <BrainCircuit className="size-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold leading-tight sm:text-2xl">
                AI Productivity Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                By Isabella Chokwe <span className="mx-1 opacity-40">|</span> CAPACITI ASA Online
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-brand">
            <Sparkles className="size-3.5" />
            Demo AI · works instantly
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav
          role="tablist"
          aria-label="Productivity tools"
          className="sticky top-2 z-10 mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card/90 p-1.5 shadow-sm backdrop-blur no-print"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                tab === id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(" ")[0]}</span>
            </button>
          ))}
        </nav>

        <section key={tab} className="mt-6 animate-fade-in">
          {tab === "tasks" && <TaskPrioritizer />}
          {tab === "email" && <EmailAssistant />}
          {tab === "study" && <StudyPlanner />}
        </section>
      </div>
    </main>
  );
}
