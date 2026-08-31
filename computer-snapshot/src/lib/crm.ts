/**
 * CRM pipeline stages and tag helpers — wire to your database via webhook/automation.
 */

export type PipelineStage =
  | "new_lead"
  | "quiz_started"
  | "quiz_completed"
  | "call_intent"
  | "booked_call"
  | "call_completed"
  | "follow_up_needed"
  | "closed_won"
  | "closed_lost"
  | "nurture"
  | "referral_source";

export const PIPELINE_STAGES: { id: PipelineStage; label: string }[] = [
  { id: "new_lead", label: "New lead" },
  { id: "quiz_started", label: "Quiz started" },
  { id: "quiz_completed", label: "Quiz completed" },
  { id: "call_intent", label: "Call intent" },
  { id: "booked_call", label: "Booked call" },
  { id: "call_completed", label: "Call completed" },
  { id: "follow_up_needed", label: "Follow-up needed" },
  { id: "closed_won", label: "Closed won" },
  { id: "closed_lost", label: "Closed lost" },
  { id: "nurture", label: "Nurture" },
  { id: "referral_source", label: "Referral source" },
];

/** Maps funnel signals to recommended pipeline stage for CRM import */
export function stageFromSignals(input: {
  quizCompleted: boolean;
  quizStarted: boolean;
  clickedCall: boolean;
  bookedCalendar: boolean;
}): PipelineStage {
  if (input.bookedCalendar) return "booked_call";
  if (input.clickedCall) return "call_intent";
  if (input.quizCompleted) return "quiz_completed";
  if (input.quizStarted) return "quiz_started";
  return "new_lead";
}
