import { describe, expect, it } from "vitest";
import type { PhaseAnswer } from "@error/shared";
import {
  drawPhaseIds,
  findPhaseByPublicId,
  normalizeText,
  PHASES,
  PHASES_PER_RUN,
  toPublicPhase,
} from "../src/game/phases.js";

const correctAnswers: Record<string, PhaseAnswer> = {
  "botao-da-cor": { kind: "choice", choiceId: "vermelho" },
  "nao-clique": { kind: "outside", target: "background" },
  "tinta-nao-significado": { kind: "choice", choiceId: "verde" },
  "barra-cheia": { kind: "wait", waitedMs: 4100 },
  "ordem-alfabetica": {
    kind: "sequence",
    order: ["abacaxi", "dragao", "macaco", "zebra"],
  },
  "quatro-por-extenso": { kind: "type", value: "Quatro." },
  "sem-a": { kind: "drag", itemId: "erro", target: "trash" },
  "erro-na-frase": { kind: "choice", choiceId: "esta" },
  "segure-tres": { kind: "hold", heldMs: 3100 },
  "numero-palavra": { kind: "choice", choiceId: "7" },
  "apenas-vogais": { kind: "multi", selected: ["a", "e", "o"] },
  "perder-para-vencer": { kind: "choice", choiceId: "perder" },
  "meses-28-dias": { kind: "choice", choiceId: "12" },
  "aviao-fronteira": { kind: "choice", choiceId: "nenhum" },
  "corrida-segundo": { kind: "choice", choiceId: "2" },
  "algodao-ferro": { kind: "choice", choiceId: "igual" },
  "moises-arca": { kind: "choice", choiceId: "nenhum" },
  "cavalo-napoleao": { kind: "type", value: "Era branco!" },
  "balde-furo": { kind: "choice", choiceId: "furo" },
  "pares-com-zero": { kind: "multi", selected: ["0", "2", "10"] },
  "fracoes-ordem": {
    kind: "sequence",
    order: ["quarto", "zero-tres", "meio", "zero-nove"],
  },
  "nao-e-fruta": { kind: "drag", itemId: "cenoura", target: "trash" },
};

describe("fases", () => {
  it("tem fases suficientes para sortear uma partida", () => {
    expect(PHASES_PER_RUN).toBe(12);
    expect(PHASES.length).toBeGreaterThan(PHASES_PER_RUN);
  });

  it("sorteia fases distintas e existentes", () => {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const ids = drawPhaseIds();
      expect(ids).toHaveLength(PHASES_PER_RUN);
      expect(new Set(ids).size).toBe(ids.length);
      ids.forEach((id) => expect(findPhaseByPublicId(id)).not.toBeNull());
    }
  });

  it("numera a fase pela posição na partida", () => {
    const phase = PHASES[5]!;
    const publicPhase = toPublicPhase(phase, 2, PHASES_PER_RUN);
    expect(publicPhase.number).toBe(3);
    expect(publicPhase.total).toBe(PHASES_PER_RUN);
    expect(publicPhase.id).toBe(phase.public.id);
  });

  it("usa identificadores únicos", () => {
    const ids = PHASES.map((phase) => phase.public.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("aceita a resposta correta de cada fase", () => {
    for (const phase of PHASES) {
      const answer = correctAnswers[phase.public.id];
      if (!answer) {
        throw new Error(`Fase sem resposta de teste: ${phase.public.id}`);
      }
      expect(
        phase.validate(answer),
        `A fase ${phase.public.id} deveria aceitar a resposta correta`,
      ).toBe(true);
    }
  });

  it("rejeita respostas erradas", () => {
    for (const phase of PHASES) {
      expect(
        phase.validate({ kind: "type", value: "resposta errada" }),
        `A fase ${phase.public.id} aceitou uma resposta inválida`,
      ).toBe(false);
    }
  });

  it("não expõe a explicação na especificação pública", () => {
    for (const phase of PHASES) {
      expect(phase.public).not.toHaveProperty("explanation");
      expect(phase.public).not.toHaveProperty("validate");
      expect(phase.explanation.length).toBeGreaterThan(20);
    }
  });
});

describe("normalizeText", () => {
  it("ignora caixa, acentos e pontuação", () => {
    expect(normalizeText("  Quatro. ")).toBe("quatro");
    expect(normalizeText("DRAGÃO")).toBe("dragao");
    expect(normalizeText("7 OITO!")).toBe("7 oito");
  });
});
