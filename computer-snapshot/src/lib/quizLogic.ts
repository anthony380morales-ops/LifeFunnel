import type {
  CoverageExisting,
  DecisionTimeline,
  PrimaryConcern,
  QuizAnswers,
  QuizResultPayload,
} from "@/types/funnel";

export interface QuizOption {
  id: string;
  label: string;
  /** Analytics / CRM value */
  value: string;
}

export interface QuizQuestionDef {
  id: keyof QuizAnswers;
  title: string;
  subtitle?: string;
  options?: QuizOption[];
  type: "single" | "text";
  optional?: boolean;
  /** Skip this question when condition matches (conditional branch) */
  skipWhen?: (answers: QuizAnswers) => boolean;
}

export const QUIZ_QUESTIONS: QuizQuestionDef[] = [
  {
    id: "employment",
    title: "How do you earn income today?",
    type: "single",
    options: [
      { id: "em1", label: "W-2 employee", value: "w2" },
      { id: "em2", label: "Business owner / self-employed", value: "business_owner" },
      { id: "em3", label: "Mix of W-2 and business", value: "both" },
      { id: "em4", label: "Retired / other", value: "retired" },
    ],
  },
  {
    id: "income_range",
    title: "Roughly, which range fits your household income?",
    subtitle: "Helps us frame strategies that fit your situation.",
    type: "single",
    skipWhen: (answers) => answers.employment === "retired",
    options: [
      { id: "ir1", label: "Under $75k", value: "under_75k" },
      { id: "ir2", label: "$75k – $150k", value: "75_150k" },
      { id: "ir3", label: "$150k – $250k", value: "150_250k" },
      { id: "ir4", label: "$250k – $500k", value: "250_500k" },
      { id: "ir5", label: "$500k+", value: "500k_plus" },
      { id: "ir6", label: "Prefer not to say", value: "prefer_not" },
    ],
  },
  {
    id: "coverage_existing",
    title: "Do you already have life insurance or retirement plans in place?",
    type: "single",
    options: [
      { id: "ce1", label: "Yes — both life protection and retirement savings", value: "yes_both" },
      { id: "ce2", label: "Life insurance, still building retirement", value: "life_only" },
      { id: "ce3", label: "Retirement savings, gaps on protection", value: "retirement_only" },
      { id: "ce4", label: "Not yet — or very minimal", value: "neither" },
      { id: "ce5", label: "Not sure what I have", value: "unsure" },
    ],
  },
  {
    id: "primary_concern",
    title: "What is your biggest focus right now?",
    type: "single",
    options: [
      { id: "pc1", label: "Tax-aware strategies", value: "taxes" },
      { id: "pc2", label: "Reliable retirement income", value: "retirement_income" },
      { id: "pc3", label: "Protecting family if something happens", value: "protect_family" },
      { id: "pc4", label: "Growing money with clarity on risk", value: "grow_safely" },
      { id: "pc5", label: "Leaving money to heirs intentionally", value: "legacy" },
    ],
  },
  {
    id: "assets_range",
    title: "Approximate investable savings and assets (excluding primary home)?",
    subtitle: "Rough range is fine.",
    type: "single",
    options: [
      { id: "ar1", label: "Under $100k", value: "under_100k" },
      { id: "ar2", label: "$100k – $500k", value: "100_500k" },
      { id: "ar3", label: "$500k – $1M", value: "500k_1m" },
      { id: "ar4", label: "$1M – $3M", value: "1m_3m" },
      { id: "ar5", label: "$3M+", value: "3m_plus" },
      { id: "ar6", label: "Prefer not to say", value: "prefer_not" },
    ],
  },
  {
    id: "decision_timeline",
    title: "How soon are you looking to decide on next steps?",
    type: "single",
    options: [
      { id: "dt1", label: "Within 30 days", value: "30_days" },
      { id: "dt2", label: "1–3 months", value: "90_days" },
      { id: "dt3", label: "Later this year", value: "this_year" },
      { id: "dt4", label: "Just exploring for now", value: "exploring" },
    ],
  },
  {
    id: "goals_open",
    title: "Anything specific about retirement or protection we should know?",
    subtitle: "Optional — one sentence is enough.",
    type: "text",
    optional: true,
  },
];

export function getVisibleQuestions(answers: QuizAnswers): QuizQuestionDef[] {
  return QUIZ_QUESTIONS.filter((q) => !(q.skipWhen?.(answers) ?? false));
}

/** True when all required questions (respecting retired branch) are answered */
export function isQuizComplete(a: QuizAnswers): boolean {
  const base: (keyof QuizAnswers)[] = [
    "employment",
    "coverage_existing",
    "primary_concern",
    "assets_range",
    "decision_timeline",
  ];
  const required = [...base];
  if (a.employment !== "retired") required.push("income_range");
  return required.every((k) => a[k] != null && String(a[k]).length > 0);
}

export function buildSegmentTags(a: QuizAnswers): string[] {
  const tags: string[] = [];
  if (a.income_range) tags.push(`income:${a.income_range}`);
  if (a.employment) tags.push(`work:${a.employment}`);
  if (a.coverage_existing) tags.push(`coverage:${a.coverage_existing}`);
  if (a.primary_concern) tags.push(`focus:${a.primary_concern}`);
  if (a.assets_range) tags.push(`assets:${a.assets_range}`);
  if (a.decision_timeline) tags.push(`timeline:${a.decision_timeline}`);
  if (a.employment === "business_owner" || a.employment === "both") tags.push("segment:business");
  if (a.decision_timeline === "30_days" || a.decision_timeline === "90_days") tags.push("intent:high");
  if (a.decision_timeline === "exploring") tags.push("intent:nurture");
  return tags;
}

function concernHeadline(c: PrimaryConcern | undefined): string {
  switch (c) {
    case "taxes":
      return "Your clarity starts with tax-aware planning choices";
    case "retirement_income":
      return "Retirement income clarity — before rates and rules change your options";
    case "protect_family":
      return "Protection-first clarity for your family’s financial continuity";
    case "grow_safely":
      return "Growth with guardrails — aligning risk with what you actually need";
    case "legacy":
      return "Legacy planning clarity — intentions, documents, and vehicles";
    default:
      return "Your personalized financial clarity snapshot";
  }
}

function coverageInsight(ce: CoverageExisting | undefined): string {
  switch (ce) {
    case "neither":
    case "unsure":
      return "You noted gaps or uncertainty in what’s already in place — that’s common, and it’s exactly where a documented strategy review helps.";
    case "life_only":
      return "You have protection-oriented pieces in place; the next step is making sure retirement income and tax posture align with those choices.";
    case "retirement_only":
      return "You’re building wealth for later years; many families in this position want to verify protection and beneficiary coordination match the bigger picture.";
    case "yes_both":
      return "You indicated both protection and retirement building blocks — many conversations here focus on coordination, tax location, and updating assumptions.";
    default:
      return "You indicated existing coverage or savings — the priority is often coordination so each piece works together rather than overlapping or leaving gaps.";
  }
}

function timelineNote(dt: DecisionTimeline | undefined): string {
  switch (dt) {
    case "30_days":
      return "Your timeline suggests you want a clear next-step roadmap soon — a short phone strategy review can translate this snapshot into prioritized actions.";
    case "90_days":
      return "A 1–3 month horizon is a practical window to compare options without rushing — speaking with our team can narrow what deserves attention first.";
    case "this_year":
      return "Planning later this year still benefits from early clarity — small adjustments often compound when they’re intentional rather than accidental.";
    case "exploring":
      return "If you’re exploring, the goal is education first — no pressure; when you’re ready, a conversation can turn general ideas into a checklist that fits you.";
    default:
      return "When you’re ready, a brief strategy review can connect these answers to concrete questions to ask your advisor — or us.";
  }
}

function buildSuggestedTopics(a: QuizAnswers): string[] {
  const topics: string[] = [];
  const c = a.primary_concern;
  if (c === "taxes" || a.employment === "business_owner" || a.employment === "both") {
    topics.push("Tax-aware withdrawal sequencing (conceptual — not tax advice)");
  }
  if (c === "retirement_income" || c === "grow_safely") {
    topics.push("Income timing and product allocation tradeoffs (for discussion only)");
  }
  if (c === "protect_family") {
    topics.push("Protection adequacy vs. goals — term, permanent, and layering concepts");
  }
  if (c === "legacy") {
    topics.push("Beneficiary alignment and legacy intentions");
  }
  topics.push("Indexed universal life, whole life, term, annuities — fit depends on underwriting & objectives");
  topics.push("Retirement distribution clarity — sequence of accounts, not predictions");
  return [...new Set(topics)].slice(0, 5);
}

function answerSummaryLines(a: QuizAnswers): string[] {
  const lines: string[] = [];
  const labelFor = (id: keyof QuizAnswers): string | undefined => {
    const q = QUIZ_QUESTIONS.find((x) => x.id === id);
    if (!q?.options) return undefined;
    const v = a[id] as string | undefined;
    if (!v) return undefined;
    return q.options.find((o) => o.value === v)?.label;
  };
  const emp = labelFor("employment");
  if (emp) lines.push(`Income style: ${emp}`);
  const inc = labelFor("income_range");
  if (inc) lines.push(`Household income (range): ${inc}`);
  const cov = labelFor("coverage_existing");
  if (cov) lines.push(`Current footprint: ${cov}`);
  const pri = labelFor("primary_concern");
  if (pri) lines.push(`Top priority: ${pri}`);
  const ast = labelFor("assets_range");
  if (ast) lines.push(`Investable assets (approx.): ${ast}`);
  const tim = labelFor("decision_timeline");
  if (tim) lines.push(`Decision horizon: ${tim}`);
  return lines;
}

/** Builds personalized, compliance-safe result copy — no guarantees or outcomes promised */
export function generateQuizResult(answers: QuizAnswers): QuizResultPayload {
  const headline = concernHeadline(answers.primary_concern);
  const summaryBullets = answerSummaryLines(answers);
  const clarityParagraph = [
    coverageInsight(answers.coverage_existing),
    timelineNote(answers.decision_timeline),
    "Insurance and annuity products have limitations, fees, and surrender charges; suitability depends on underwriting and your objectives. This assessment is educational and not a recommendation.",
  ]
    .filter(Boolean)
    .join(" ");
  const suggestedTopics = buildSuggestedTopics(answers);
  const segmentTags = buildSegmentTags(answers);
  return {
    headline,
    summaryBullets,
    clarityParagraph,
    suggestedTopics,
    segmentTags,
  };
}
