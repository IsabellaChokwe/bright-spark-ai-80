export type Priority = "high" | "medium" | "low";

export type PrioritizedTask = {
  id: string;
  text: string;
  priority: Priority;
  minutes: number;
  reasons: string[];
  done: boolean;
};

const HIGH_HINTS = [
  "today",
  "tonight",
  "tomorrow",
  "asap",
  "urgent",
  "deadline",
  "due",
  "exam",
  "test",
  "submit",
  "interview",
  "final",
  "presentation",
  "pay",
  "fee",
];
const MEDIUM_HINTS = [
  "assignment",
  "report",
  "email",
  "draft",
  "meeting",
  "group",
  "study",
  "revise",
  "review",
  "practice",
  "lab",
  "quiz",
  "apply",
  "cv",
  "resume",
];
const LOW_HINTS = [
  "someday",
  "maybe",
  "clean",
  "organise",
  "organize",
  "watch",
  "read for fun",
  "tidy",
  "backup",
  "print",
  "sort",
];

const REASON_LABELS: Record<string, string> = {
  today: "Due today",
  tonight: "Due tonight",
  tomorrow: "Due tomorrow",
  asap: "Flagged ASAP",
  urgent: "Marked urgent",
  deadline: "Hard deadline",
  due: "Has a due date",
  exam: "Graded assessment",
  test: "Graded assessment",
  submit: "Submission required",
  interview: "Career-critical",
  final: "High weighting",
  presentation: "Others depend on you",
  pay: "Financial deadline",
  fee: "Financial deadline",
  assignment: "Coursework",
  report: "Coursework",
  email: "Quick win",
  draft: "Quick win",
  meeting: "Scheduled with others",
  group: "Team dependency",
  study: "Ongoing learning",
  revise: "Ongoing learning",
  review: "Ongoing learning",
  practice: "Skill building",
  lab: "Coursework",
  quiz: "Graded assessment",
  apply: "Opportunity window",
  cv: "Career growth",
  resume: "Career growth",
};

function estimateMinutes(text: string, priority: Priority) {
  const words = text.trim().split(/\s+/).length;
  const base = priority === "high" ? 55 : priority === "medium" ? 40 : 25;
  const spread = ((words * 7) % 30) - 10;
  return Math.max(10, Math.round((base + spread) / 5) * 5);
}

export function parseTasks(raw: string): string[] {
  return raw
    .split(/\r?\n|,|;|•/)
    .map((line) => line.replace(/^\s*(?:[-*\d.)\]]+)\s*/, "").trim())
    .filter((line) => line.length > 1);
}

export function prioritizeTasks(lines: string[]): PrioritizedTask[] {
  const scored = lines.map((text, index) => {
    const lower = text.toLowerCase();
    const hits = (list: string[]) => list.filter((k) => lower.includes(k));
    const high = hits(HIGH_HINTS);
    const medium = hits(MEDIUM_HINTS);
    const low = hits(LOW_HINTS);

    let priority: Priority = "medium";
    if (high.length > 0) priority = "high";
    else if (low.length > 0) priority = "low";
    else if (medium.length > 0) priority = "medium";
    else priority = index < 2 ? "medium" : "low";

    const matched = [...high, ...medium, ...low].slice(0, 2);
    const reasons = matched.map((k) => REASON_LABELS[k] ?? "Detected keyword");
    if (reasons.length === 0) {
      reasons.push(
        priority === "medium" ? "No date given — schedule this week" : "No urgency signals",
      );
    }
    if (priority === "high" && reasons.length < 2) reasons.push("Blocks other work");

    return {
      id: `${Date.now()}-${index}`,
      text: text.charAt(0).toUpperCase() + text.slice(1),
      priority,
      minutes: estimateMinutes(text, priority),
      reasons: [...new Set(reasons)],
      done: false,
    };
  });

  const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  return scored.sort((a, b) => order[a.priority] - order[b.priority]);
}

export type Tone = "Formal" | "Polite & Friendly" | "Urgent" | "Follow-up";

const GREETING: Record<Tone, (r: string) => string> = {
  Formal: (r) => `Dear ${r},`,
  "Polite & Friendly": (r) => `Hi ${r},`,
  Urgent: (r) => `Dear ${r},`,
  "Follow-up": (r) => `Hi ${r},`,
};

const OPENER: Record<Tone, string> = {
  Formal:
    "I hope this message finds you well. I am writing to you regarding the matter set out below.",
  "Polite & Friendly":
    "I hope you're having a good week! I wanted to reach out about something quickly.",
  Urgent:
    "I hope you are well. I am writing with a time-sensitive request and would appreciate your help today if possible.",
  "Follow-up":
    "I hope you're well. I'm following up on my previous message to keep this moving along.",
};

const CLOSER: Record<Tone, string> = {
  Formal: "Thank you for your time and consideration. I look forward to your response.",
  "Polite & Friendly": "Thanks so much for your help — I really appreciate it!",
  Urgent:
    "I would be very grateful for a reply at your earliest convenience, as the deadline is close.",
  "Follow-up": "No rush at all — I just wanted to make sure this didn't get lost. Thank you!",
};

const SIGN_OFF: Record<Tone, string> = {
  Formal: "Yours sincerely,",
  "Polite & Friendly": "Warm regards,",
  Urgent: "Kind regards,",
  "Follow-up": "Kind regards,",
};

export function draftEmail(input: {
  recipient: string;
  points: string;
  tone: Tone;
  sender: string;
  variant?: number;
}): { subject: string; body: string } {
  const recipient = input.recipient.trim() || "Professor";
  const tone = input.tone;
  const bullets = input.points
    .split(/\r?\n|;/)
    .map((p) => p.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);

  const topic = bullets[0] ?? "an academic matter";
  const shortTopic = topic.length > 58 ? `${topic.slice(0, 55)}…` : topic;

  const subjectVariants = [
    `${tone === "Follow-up" ? "Follow-up: " : ""}${shortTopic.charAt(0).toUpperCase() + shortTopic.slice(1)}`,
    `${tone === "Urgent" ? "Time-sensitive: " : "Request: "}${shortTopic}`,
    `Quick question about ${shortTopic.toLowerCase()}`,
  ];
  const subject = subjectVariants[(input.variant ?? 0) % subjectVariants.length]!;

  const detail =
    bullets.length > 1
      ? bullets.map((b) => `• ${b.charAt(0).toUpperCase() + b.slice(1)}`).join("\n")
      : `${topic.charAt(0).toUpperCase() + topic.slice(1)}.`;

  const body = [
    GREETING[tone](recipient),
    "",
    OPENER[tone],
    "",
    bullets.length > 1 ? "In summary:" : "",
    detail,
    "",
    tone === "Urgent"
      ? "If it helps, I am happy to provide any further documents or meet at short notice."
      : "Please let me know if you need any additional information from my side.",
    "",
    CLOSER[tone],
    "",
    SIGN_OFF[tone],
    input.sender,
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");

  return { subject, body };
}

export type StudyBlock = {
  subject: string;
  focus: string;
  hours: number;
  colorIndex: number;
};

export type StudyDay = {
  day: string;
  blocks: StudyBlock[];
  breakTip: string;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const FOCUS_TEMPLATES = [
  "Active recall of core concepts",
  "Past paper questions (timed)",
  "Summary notes + flashcards",
  "Problem sets & worked examples",
  "Teach-back: explain aloud",
  "Weak-spot repair session",
  "Mixed-topic mock quiz",
];

const BREAK_TIPS = [
  "50/10 rule: 10 min walk after each block",
  "Hydrate + 5 min stretch between subjects",
  "Screen-free 15 min break after block two",
  "Short nap or music break mid-session",
  "Study with a friend, break together",
  "Longer 30 min break — you earned it",
  "Light review only, then rest properly",
];

export function generateSchedule(
  subjects: string[],
  hoursPerDay: number,
  examDates: Record<string, string>,
): StudyDay[] {
  const list = subjects.length > 0 ? subjects : ["General revision"];
  const withUrgency = [...list].sort((a, b) => {
    const da = examDates[a] ? Date.parse(examDates[a]!) : Number.MAX_SAFE_INTEGER;
    const db = examDates[b] ? Date.parse(examDates[b]!) : Number.MAX_SAFE_INTEGER;
    return da - db;
  });

  let cursor = 0;
  return DAYS.map((day, dayIndex) => {
    const isSunday = day === "Sunday";
    const dayHours = isSunday ? Math.max(1, Math.round(hoursPerDay / 2)) : hoursPerDay;
    const blockCount = Math.min(withUrgency.length, Math.max(1, Math.min(3, Math.round(dayHours / 1.5))));
    const blocks: StudyBlock[] = [];
    let remaining = dayHours;

    for (let b = 0; b < blockCount; b++) {
      const subject = withUrgency[cursor % withUrgency.length]!;
      cursor++;
      const hours =
        b === blockCount - 1
          ? Math.max(0.5, Math.round(remaining * 2) / 2)
          : Math.max(0.5, Math.round((dayHours / blockCount) * 2) / 2);
      remaining = Math.max(0, remaining - hours);
      blocks.push({
        subject,
        focus: FOCUS_TEMPLATES[(dayIndex + b) % FOCUS_TEMPLATES.length]!,
        hours,
        colorIndex: list.indexOf(subject) === -1 ? 0 : list.indexOf(subject),
      });
    }

    return { day, blocks, breakTip: BREAK_TIPS[dayIndex % BREAK_TIPS.length]! };
  });
}

export function scheduleToText(schedule: StudyDay[]) {
  return schedule
    .map(
      (d) =>
        `${d.day}\n${d.blocks
          .map((b) => `  - ${b.subject} (${b.hours}h) — ${b.focus}`)
          .join("\n")}\n  Break: ${d.breakTip}`,
    )
    .join("\n\n");
}
