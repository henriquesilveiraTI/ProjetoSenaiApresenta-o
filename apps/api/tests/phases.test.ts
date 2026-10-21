import { describe, expect, it } from "vitest";
import type { PhaseAnswer } from "@error/shared";
import { PHASES, normalizeText, TOTAL_PHASES } from "../src/game/phases.js";

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
};

describe("fases", () => {
  it("tem a quantidade anunciada e numeração sequencial", () => {
    expect(PHASES).toHaveLength(TOTAL_PHASES);
    expect(TOTAL_PHASES).toBe(12);

    PHASES.forEach((phase, index) => {
      expect(phase.public.number).toBe(index + 1);
      expect(phase.public.total).toBe(TOTAL_PHASES);
    });
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
