import { useState } from "react";
import {
  CalendarDays,
  Check,
  Clock,
  Coffee,
  Copy,
  GraduationCap,
  Plus,
  Printer,
  Sparkles,
  X,
} from "lucide-react";
import { Badge, Button, Card, Input, Label, SectionTitle, ThinkingLine } from "./ui-kit";
import { generateSchedule, scheduleToText, type StudyDay } from "@/lib/mock-ai";
import { cn } from "@/lib/utils";

const SUBJECT_STYLES = [
  "bg-brand-soft text-brand border-brand/30",
  "bg-medium-soft text-medium-foreground border-medium/40",
  "bg-low-soft text-low border-low/30",
  "bg-violet-soft text-violet border-violet/30",
  "bg-cyan-soft text-cyan border-cyan/30",
  "bg-high-soft text-high border-high/30",
];

export function StudyPlanner() {
  const [subjects, setSubjects] = useState<string[]>([
    "Data Science",
    "Statistics",
    "Business Comms",
  ]);
  const [draft, setDraft] = useState("");
  const [examDates, setExamDates] = useState<Record<string, string>>({});
  const [hours, setHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<StudyDay[] | null>(null);
  const [copied, setCopied] = useState(false);

  const addSubject = () => {
    const value = draft.trim();
    if (!value || subjects.includes(value)) return;
    setSubjects([...subjects, value]);
    setDraft("");
  };

  const removeSubject = (s: string) => {
    setSubjects(subjects.filter((x) => x !== s));
    const next = { ...examDates };
    delete next[s];
    setExamDates(next);
  };

  const generate = () => {
    setLoading(true);
    setSchedule(null);
    setTimeout(() => {
      setSchedule(generateSchedule(subjects, hours, examDates));
      setLoading(false);
    }, 1500);
  };

  const copy = async () => {
    if (!schedule) return;
    await navigator.clipboard.writeText(scheduleToText(schedule));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const styleFor = (subject: string) =>
    SUBJECT_STYLES[Math.max(0, subjects.indexOf(subject)) % SUBJECT_STYLES.length]!;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <Card className="h-fit p-5 no-print">
        <SectionTitle
          icon={<GraduationCap className="size-5" />}
          title="Study Planner"
          subtitle="Build a balanced week around your exams."
        />
        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="subject">Subjects / courses</Label>
            <div className="flex gap-2">
              <Input
                id="subject"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubject();
                  }
                }}
                placeholder="Add a subject and press Enter"
              />
              <Button variant="outline" onClick={addSubject} aria-label="Add subject">
                <Plus className="size-4" />
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {subjects.map((s) => (
                <span
                  key={s}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
                    styleFor(s),
                  )}
                >
                  {s}
                  <button onClick={() => removeSubject(s)} aria-label={`Remove ${s}`}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {subjects.length > 0 && (
            <div className="space-y-2">
              <Label>Target exam dates</Label>
              {subjects.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="w-1/2 truncate text-sm text-muted-foreground">{s}</span>
                  <Input
                    type="date"
                    value={examDates[s] ?? ""}
                    onChange={(e) => setExamDates({ ...examDates, [s]: e.target.value })}
                    aria-label={`Exam date for ${s}`}
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <Label htmlFor="hours">Daily study hours available: {hours}h</Label>
            <input
              id="hours"
              type="range"
              min={1}
              max={8}
              step={1}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <Button className="w-full" loading={loading} onClick={generate}>
            {!loading && <Sparkles className="size-4" />}
            {loading ? "Building your week…" : "Generate Study Schedule"}
          </Button>
          {loading && <ThinkingLine label="Weighting subjects by exam proximity…" />}
        </div>
      </Card>

      <div className="space-y-4">
        {!schedule && !loading && (
          <Card className="grid place-items-center p-10 text-center">
            <CalendarDays className="size-8 text-cyan" />
            <p className="mt-3 font-semibold">Your timetable will appear here</p>
            <p className="text-sm text-muted-foreground">
              Add subjects, set exam dates, then generate.
            </p>
          </Card>
        )}

        {loading && (
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse p-5">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="mt-3 h-12 rounded bg-muted" />
              </Card>
            ))}
          </div>
        )}

        {schedule && !loading && (
          <>
            <div className="flex flex-wrap gap-2 no-print">
              <Button variant="outline" onClick={copy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied!" : "Copy schedule"}
              </Button>
              <Button variant="ghost" onClick={() => window.print()}>
                <Printer className="size-4" />
                Print / export
              </Button>
            </div>
            <div className="grid animate-fade-in gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {schedule.map((day) => (
                <Card key={day.day} className="p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{day.day}</h3>
                    <Badge className="bg-muted text-muted-foreground">
                      <Clock className="size-3" />
                      {day.blocks.reduce((s, b) => s + b.hours, 0)}h
                    </Badge>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {day.blocks.map((block, i) => (
                      <li
                        key={`${day.day}-${i}`}
                        className={cn("rounded-xl border p-3", styleFor(block.subject))}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{block.subject}</p>
                          <span className="text-xs font-semibold">{block.hours}h</span>
                        </div>
                        <p className="mt-1 text-xs opacity-80">{block.focus}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Coffee className="size-3.5" />
                    {day.breakTip}
                  </p>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
