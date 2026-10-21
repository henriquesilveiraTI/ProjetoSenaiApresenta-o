/**
 * Contratos compartilhados entre a API e o cliente web.
 *
 * Nenhuma solução de fase vive aqui: o cliente recebe apenas a especificação
 * pública da fase e envia a resposta para validação no servidor.
 */

export const MAX_LIVES = 3;
export const MIN_NICKNAME_LENGTH = 2;
export const MAX_NICKNAME_LENGTH = 20;

export type RunStatus = "active" | "completed" | "failed" | "abandoned";

export type PhaseKind =
  | "choice"
  | "outside"
  | "wait"
  | "sequence"
  | "type"
  | "drag"
  | "hold"
  | "multi";

export type SurfaceTone = "panel" | "danger" | "neon" | "ghost";
export type TextTone =
  | "ink"
  | "void"
  | "neon"
  | "danger"
  | "muted"
  | "amber"
  | "sky"
  | "violet";
export type ChoiceSize = "sm" | "md" | "lg";

export interface PhaseChoice {
  id: string;
  label: string;
  surface?: SurfaceTone;
  labelTone?: TextTone;
  size?: ChoiceSize;
}

interface PhaseBase {
  id: string;
  number: number;
  total: number;
  prompt: string;
  eyebrow: string;
  note?: string;
}

export interface ChoicePhase extends PhaseBase {
  kind: "choice";
  choices: PhaseChoice[];
  columns?: 1 | 2 | 3;
}

export interface OutsidePhase extends PhaseBase {
  kind: "outside";
  panelTitle: string;
  decoys: PhaseChoice[];
}

export interface WaitPhase extends PhaseBase {
  kind: "wait";
  buttonLabel: string;
  waitingLabel: string;
  readyLabel: string;
  waitMs: number;
}

export interface SequencePhase extends PhaseBase {
  kind: "sequence";
  items: PhaseChoice[];
  submitLabel: string;
  selectedLabel: string;
}

export interface TypePhase extends PhaseBase {
  kind: "type";
  placeholder: string;
  submitLabel: string;
  maxLength: number;
  helper?: string;
}

export interface DragPhase extends PhaseBase {
  kind: "drag";
  items: PhaseChoice[];
  targetLabel: string;
  keepLabel: string;
  selectHint: string;
}

export interface HoldPhase extends PhaseBase {
  kind: "hold";
  buttonLabel: string;
  holdingLabel: string;
  doneLabel: string;
  holdMs: number;
}

export interface MultiPhase extends PhaseBase {
  kind: "multi";
  items: PhaseChoice[];
  submitLabel: string;
  selectedLabel: string;
}

export type PublicPhase =
  | ChoicePhase
  | OutsidePhase
  | WaitPhase
  | SequencePhase
  | TypePhase
  | DragPhase
  | HoldPhase
  | MultiPhase;

export type PhaseAnswer =
  | { kind: "choice"; choiceId: string }
  | { kind: "outside"; target: "background" | "panel" }
  | { kind: "wait"; waitedMs: number }
  | { kind: "sequence"; order: string[] }
  | { kind: "type"; value: string }
  | { kind: "drag"; itemId: string; target: "trash" | "keep" }
  | { kind: "hold"; heldMs: number }
  | { kind: "multi"; selected: string[] };

export interface PlayerProfile {
  id: string;
  nickname: string;
  createdAt: string;
}

export interface RunState {
  id: string;
  status: RunStatus;
  score: number;
  lives: number;
  maxLives: number;
  streak: number;
  bestStreak: number;
  currentPhaseIndex: number;
  cleared: number;
  totalPhases: number;
  correctCount: number;
  wrongCount: number;
  startedAt: string;
  phaseStartedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  phase: PublicPhase | null;
}

export interface AnswerResult {
  correct: boolean;
  points: number;
  feedback: string;
  explanation: string;
  run: RunState;
}

export interface AnswerLog {
  phaseIndex: number;
  phaseId: string;
  phaseTitle: string;
  correct: boolean;
  points: number;
  durationMs: number;
}

export interface RunDetails {
  run: RunState;
  answers: AnswerLog[];
}

export interface CreateRunResponse {
  run: RunState;
  resumed: boolean;
}

export interface ActiveRunResponse {
  run: RunState | null;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  nickname: string;
  score: number;
  cleared: number;
  totalPhases: number;
  correctCount: number;
  wrongCount: number;
  bestStreak: number;
  status: Extract<RunStatus, "completed" | "failed">;
  durationMs: number | null;
  finishedAt: string;
}

export interface RunSummary {
  id: string;
  status: RunStatus;
  score: number;
  cleared: number;
  totalPhases: number;
  correctCount: number;
  wrongCount: number;
  bestStreak: number;
  durationMs: number | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface PlayerStats {
  games: number;
  completed: number;
  failed: number;
  bestScore: number;
  totalCorrect: number;
  totalAnswers: number;
  accuracy: number;
  bestStreak: number;
  totalTimeMs: number;
  recentRuns: RunSummary[];
}

export interface GuestAuthResponse {
  token: string;
  player: PlayerProfile;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
