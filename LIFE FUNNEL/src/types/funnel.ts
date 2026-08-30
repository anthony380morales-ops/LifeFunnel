/** Quiz answer keys — stable for CRM tags and analytics */
export type QuizAnswerKey =
  | "income_range"
  | "employment"
  | "coverage_existing"
  | "primary_concern"
  | "assets_range"
  | "decision_timeline"
  | "goals_open";

export type IncomeRange =
  | "under_75k"
  | "75_150k"
  | "150_250k"
  | "250_500k"
  | "500k_plus"
  | "prefer_not";

export type Employment = "w2" | "business_owner" | "both" | "retired";

export type CoverageExisting =
  | "yes_both"
  | "life_only"
  | "retirement_only"
  | "neither"
  | "unsure";

export type PrimaryConcern =
  | "taxes"
  | "retirement_income"
  | "protect_family"
  | "grow_safely"
  | "legacy";

export type AssetsRange =
  | "under_100k"
  | "100_500k"
  | "500k_1m"
  | "1m_3m"
  | "3m_plus"
  | "prefer_not";

export type DecisionTimeline =
  | "30_days"
  | "90_days"
  | "this_year"
  | "exploring";

export interface QuizAnswers {
  income_range?: IncomeRange;
  employment?: Employment;
  coverage_existing?: CoverageExisting;
  primary_concern?: PrimaryConcern;
  assets_range?: AssetsRange;
  decision_timeline?: DecisionTimeline;
  /** Optional open-ended */
  goals_open?: string;
}

export interface QuizResultPayload {
  headline: string;
  summaryBullets: string[];
  clarityParagraph: string;
  suggestedTopics: string[];
  segmentTags: string[];
}

export interface LeadPayload {
  source: "funnel_quiz";
  page: string;
  answers: QuizAnswers;
  tags: string[];
  consent_email: boolean;
  consent_sms: boolean;
  /** Express consent to receive an automated/AI-assisted outbound call */
  consent_call: boolean;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  pipeline_stage: string;
  submitted_at: string;
  /** quiz_started_at from session */
  session_started_at?: string;
}
