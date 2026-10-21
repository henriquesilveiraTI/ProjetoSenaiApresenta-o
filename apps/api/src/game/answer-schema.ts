import { z } from "zod";
import type { PhaseAnswer } from "@error/shared";
import { ApiError } from "../lib/api-error.js";

const choiceAnswer = z.object({
  kind: z.literal("choice"),
  choiceId: z.string().min(1).max(80),
});

const outsideAnswer = z.object({
  kind: z.literal("outside"),
  target: z.enum(["background", "panel"]),
});

const waitAnswer = z.object({
  kind: z.literal("wait"),
  waitedMs: z.number().int().min(0).max(600_000),
});

const sequenceAnswer = z.object({
  kind: z.literal("sequence"),
  order: z.array(z.string().min(1).max(80)).max(20),
});

const typeAnswer = z.object({
  kind: z.literal("type"),
  value: z.string().max(200),
});

const dragAnswer = z.object({
  kind: z.literal("drag"),
  itemId: z.string().min(1).max(80),
  target: z.enum(["trash", "keep"]),
});

const holdAnswer = z.object({
  kind: z.literal("hold"),
  heldMs: z.number().int().min(0).max(600_000),
});

const multiAnswer = z.object({
  kind: z.literal("multi"),
  selected: z.array(z.string().min(1).max(80)).max(30),
});

export const phaseAnswerSchema = z.discriminatedUnion("kind", [
  choiceAnswer,
  outsideAnswer,
  waitAnswer,
  sequenceAnswer,
  typeAnswer,
  dragAnswer,
  holdAnswer,
  multiAnswer,
]);

export function parsePhaseAnswer(value: unknown): PhaseAnswer {
  const parsed = phaseAnswerSchema.safeParse(value);

  if (!parsed.success) {
    throw ApiError.badRequest(
      "INVALID_ANSWER",
      "A resposta enviada não tem o formato esperado.",
      z.prettifyError(parsed.error),
    );
  }

  return parsed.data;
}
