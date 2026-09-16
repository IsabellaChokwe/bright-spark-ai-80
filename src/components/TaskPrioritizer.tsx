import { useState } from "react";
import {
  AlarmClock,
  CheckCircle2,
  Circle,
  ListChecks,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { Badge, Button, Card, Label, SectionTitle, Textarea, ThinkingLine } from "./ui-kit";
import { parseTasks, prioritizeTasks, type Priority, type PrioritizedTask } from "@/lib/mock-ai";
import { cn } from "@/lib/utils";

const SAMPLE = `Submit Data Science assignment due tomorrow
Email Professor Mbeki about the extension
Prepare slides for group presentation on Friday
Revise statistics chapter 4
Apply for the internship at CAPACITI
Organise my study desk`;

const META: Record<
  Priority,
  { label: string; card: string; chip: string; bar: string; dot: string }
> = {
  high: {
    label: "High priority",
    card: "border-high/40 bg-high-soft",
    chip: "bg-high text-high-foreground",
    bar: "bg-high",
    dot: "text-high",
  },
  medium: {
    label: "Medium priority",
    card: "border-medium/40 bg-medium-soft",
    chip: "bg-medium text-medium-foreground",
    bar: "bg-medium",
    dot: "text-medium",
  },
  low: {
    label: "Low priority",
    card: "border-low/40 bg-low-soft",
    chip: "bg-low text-low-foreground",
    bar: "bg-low",
    dot: "text-low",
  },
};

export function TaskPrioritizer() {
  const [raw, setRaw] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<PrioritizedTask[]>([]);

  const run = () => {
    const lines = parseTasks(raw);
    if (lines.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      setTasks(prioritizeTasks(lines));
      setLoading(false);
    }, 1400);
  };

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const doneCount = tasks.filter((t) => t.done).length;
  const totalMinutes = tasks.filter((t) => !t.done).reduce((sum, t) => sum + t.minutes, 0);
  const groups: Priority[] = ["high", "medium", "low"];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <Card className="h-fit p-5">
        <SectionTitle
          icon={<ListChecks className="size-5" />}
          title="Task Prioritizer"
          subtitle="Paste your to-do list and let AI rank it."
        />
        <div className="mt-5">
          <Label htmlFor="tasks">Your to-do items (one per line)</Label>
          <Textarea
            id="tasks"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Finish lab report due tomorrow&#10;Email my group about the meeting"
            className="min-h-44"
          />
        </div>
        <Button className="mt-4 w-full" loading={loading} onClick={run}>
          {!loading && <Sparkles className="size-4" />}
          {loading ? "Analysing urgency…" : "Prioritize with AI"}
        </Button>
        {loading && (
          <div className="mt-3">
            <ThinkingLine label="Scoring deadlines, effort and dependencies" />
          </div>
        )}
        {tasks.length > 0 && !loading && (
          <div className="mt-4 rounded-xl bg-muted p-3 text-sm">
            <p className="font-semibold">
              {doneCount}/{tasks.length} complete
            </p>
            <p className="text-muted-foreground">
              ~{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m of focused work left
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      <div className="space-y-5">
        {tasks.length === 0 && !loading && (
          <Card className="grid place-items-center p-10 text-center">
            <Sparkles className="size-8 text-brand" />
            <p className="mt-3 font-semibold">No tasks ranked yet</p>
            <p className="text-sm text-muted-foreground">
              Add your list on the left and hit “Prioritize with AI”.
            </p>
          </Card>
        )}

        {loading && (
          <div className="grid gap-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="animate-pulse p-5">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="mt-3 h-3 w-2/3 rounded bg-muted" />
              </Card>
            ))}
          </div>
        )}

        {groups.map((group) => {
          const items = tasks.filter((t) => t.priority === group);
          if (items.length === 0) return null;
          return (
            <section key={group} className="animate-fade-in">
              <div className="mb-2 flex items-center gap-2">
                <span className={cn("h-2.5 w-8 rounded-full", META[group].bar)} />
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  {META[group].label}
                </h3>
                <span className="text-xs text-muted-foreground">({items.length})</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((task) => (
                  <Card
                    key={task.id}
                    className={cn(
                      "border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
                      META[task.priority].card,
                      task.done && "opacity-60",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggle(task.id)}
                        aria-label={task.done ? "Mark as not done" : "Mark as complete"}
                        className="mt-0.5 shrink-0"
                      >
                        {task.done ? (
                          <CheckCircle2 className={cn("size-5", META[task.priority].dot)} />
                        ) : (
                          <Circle className="size-5 text-muted-foreground" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "font-medium leading-snug",
                            task.done && "line-through decoration-2",
                          )}
                        >
                          {task.text}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge className={META[task.priority].chip}>
                            {task.priority.toUpperCase()}
                          </Badge>
                          <Badge className="bg-background/70 text-foreground">
                            <AlarmClock className="size-3" />
                            {task.minutes} min
                          </Badge>
                          {task.reasons.map((r) => (
                            <Badge key={r} className="bg-background/70 text-muted-foreground">
                              <Tag className="size-3" />
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(task.id)}
                        aria-label="Remove task"
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
