import { useEffect, useRef, useState } from "react";
import { Check, Copy, Mail, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { Badge, Button, Card, Input, Label, SectionTitle, Textarea, ThinkingLine } from "./ui-kit";
import { draftEmail, type Tone } from "@/lib/mock-ai";
import { cn } from "@/lib/utils";

const TONES: Tone[] = ["Formal", "Polite & Friendly", "Urgent", "Follow-up"];
const RECIPIENTS = ["Professor", "Internship Recruiter", "Group Member", "Course Administrator"];

export function EmailAssistant() {
  const [recipient, setRecipient] = useState("Professor Mbeki");
  const [points, setPoints] = useState(
    "Requesting a two-day extension on the data science assignment\nI was ill over the weekend and have a doctor's note\nI can submit by Thursday at the latest",
  );
  const [tone, setTone] = useState<Tone>("Formal");
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState(0);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [typed, setTyped] = useState("");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const generate = (nextVariant = variant) => {
    if (!points.trim()) return;
    setLoading(true);
    setResult(null);
    setTyped("");
    setTimeout(() => {
      const draft = draftEmail({
        recipient,
        points,
        tone,
        sender: "Isabella Chokwe",
        variant: nextVariant,
      });
      setResult(draft);
      setLoading(false);
    }, 1300);
  };

  useEffect(() => {
    if (!result) return;
    let i = 0;
    timer.current = setInterval(() => {
      i += 6;
      setTyped(result.body.slice(0, i));
      if (i >= result.body.length && timer.current) clearInterval(timer.current);
    }, 16);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [result]);

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <Card className="h-fit p-5">
        <SectionTitle
          icon={<Mail className="size-5" />}
          title="Email Draft Assistant"
          subtitle="Turn rough notes into a polished email."
        />
        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="recipient">Who are you emailing?</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Professor, recruiter, group member…"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {RECIPIENTS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRecipient(r)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="points">Key points / what you want to say</Label>
            <Textarea
              id="points"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="One idea per line"
            />
          </div>
          <div>
            <Label>Tone (optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  aria-pressed={tone === t}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                    tone === t
                      ? "border-primary bg-brand-soft text-brand"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full" loading={loading} onClick={() => generate()}>
            {!loading && <Wand2 className="size-4" />}
            {loading ? "Drafting…" : "Draft Email"}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {loading && (
          <Card className="p-5">
            <ThinkingLine label="Choosing a subject line and shaping the tone…" />
            <div className="mt-4 space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-3 animate-pulse rounded bg-muted"
                  style={{ width: `${90 - i * 12}%` }}
                />
              ))}
            </div>
          </Card>
        )}

        {!loading && !result && (
          <Card className="grid place-items-center p-10 text-center">
            <Sparkles className="size-8 text-violet" />
            <p className="mt-3 font-semibold">Your draft appears here</p>
            <p className="text-sm text-muted-foreground">
              Fill in the details and press “Draft Email”.
            </p>
          </Card>
        )}

        {result && !loading && (
          <Card className="animate-fade-in overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/60 px-5 py-3">
              <Badge className="bg-brand-soft text-brand">{tone}</Badge>
              <span className="text-xs text-muted-foreground">Draft ready • review before sending</span>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Subject
              </p>
              <p className="mt-1 text-base font-semibold">{result.subject}</p>
              <div className="my-4 h-px bg-border" />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Body
              </p>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {typed}
                {typed.length < result.body.length && (
                  <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary align-middle" />
                )}
              </pre>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border px-5 py-4">
              <Button variant="outline" onClick={copy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const next = variant + 1;
                  setVariant(next);
                  generate(next);
                }}
              >
                <RefreshCw className="size-4" />
                Regenerate
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
