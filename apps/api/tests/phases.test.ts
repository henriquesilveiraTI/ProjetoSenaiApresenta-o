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
  "botao-da-cor": { kind: "choice", choiceId: "botao" },
  "nao-clique": { kind: "outside", target: "background" },
  "tinta-nao-significado": { kind: "choice", choiceId: "verde" },
  "meses-letras": {
    kind: "sequence",
    order: ["maio", "abril", "agosto", "outubro"],
  },
  "nao-e-mamifero": { kind: "drag", itemId: "pinguim", target: "trash" },
  "erro-na-frase": { kind: "choice", choiceId: "esta" },
  "ovelhas-menos-nove": { kind: "choice", choiceId: "9" },
  palindromos: { kind: "multi", selected: ["radar", "ovo", "arara"] },
  "bola-e-taco": { kind: "choice", choiceId: "05" },
  "meses-28-dias": { kind: "choice", choiceId: "12" },
  "aviao-fronteira": { kind: "choice", choiceId: "nenhum" },
  "corrida-segundo": { kind: "choice", choiceId: "2" },
  "buraco-terra": { kind: "choice", choiceId: "nenhuma" },
  "moises-arca": { kind: "choice", choiceId: "nenhum" },
  "errado-dicionario": { kind: "type", value: "Errado!" },
  "balde-furo": { kind: "choice", choiceId: "furo" },
  "pares-com-zero": { kind: "multi", selected: ["0", "2", "10"] },
  "fracoes-ordem": {
    kind: "sequence",
    order: ["quarto", "zero-tres", "meio", "zero-nove"],
  },
  "nao-e-fruta": { kind: "drag", itemId: "cenoura", target: "trash" },
  "galo-telhado": { kind: "choice", choiceId: "nenhum" },
  "planta-lago": { kind: "choice", choiceId: "29" },
  "filhas-maria": { kind: "choice", choiceId: "maria" },
  comprimidos: { kind: "type", value: "60 minutos" },
  "horarios-dia": {
    kind: "sequence",
    order: ["00h15", "11h45", "12h30", "13h05"],
  },
  "nao-e-capital": { kind: "drag", itemId: "santos", target: "trash" },
  "nada-verde": { kind: "choice", choiceId: "amarelo" },
  "proximo-numero": { kind: "type", value: "Treze" },
  "anagrama-amor": { kind: "drag", itemId: "aroma", target: "trash" },
  "quilo-algodao": { kind: "choice", choiceId: "iguais" },
  "fosforo-escuro": { kind: "choice", choiceId: "fosforo" },
  "dividir-por-meio": { kind: "type", value: "70" },
  "trem-eletrico": { kind: "choice", choiceId: "nenhum" },
  "irma-hospital": { kind: "choice", choiceId: "irma" },
  "depois-de-amanha": { kind: "choice", choiceId: "segunda" },
  "pesos-ordem": {
    kind: "sequence",
    order: ["chumbo", "ferro", "pena", "algodao"],
  },
  "nao-e-planeta": { kind: "drag", itemId: "plutao", target: "trash" },
  "nao-e-peixe": { kind: "drag", itemId: "golfinho", target: "trash" },
  "macas-cesta": { kind: "type", value: "Duas" },
  "cor-que-diz": { kind: "choice", choiceId: "azul" },
  "meio-de-paris": { kind: "choice", choiceId: "letra-r" },
  "duzias-ordem": {
    kind: "sequence",
    order: ["meia-duzia", "oito", "dezena", "duzia"],
  },
  "maior-numero": { kind: "choice", choiceId: "1000" },
  "buracos-camiseta": { kind: "type", value: "4 buracos" },
  "cai-em-pe": { kind: "choice", choiceId: "chuva" },
  "painel-quebrado": { kind: "outside", target: "background" },
  "letras-o-alfabeto": { kind: "type", value: "Nove" },
  "numeros-alfabetica": {
    kind: "sequence",
    order: ["dois", "quatro", "tres", "um"],
  },
  "sem-perna": { kind: "drag", itemId: "cobra", target: "trash" },
  "dentes-nao-morde": {
    kind: "multi",
    selected: ["engrenagem", "pente", "serrote"],
  },
  "anda-com-as-patas": { kind: "choice", choiceId: "pato" },
  "quanto-mais-tira": { kind: "type", value: "Um buraco!" },
  "girafa-geladeira": { kind: "choice", choiceId: "abre-fecha" },
  "lados-da-bola": { kind: "choice", choiceId: "2" },
};

describe("banco de perguntas", () => {
  it("tem 53 fases", () => {
    expect(PHASES).toHaveLength(53);
  });
});

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
