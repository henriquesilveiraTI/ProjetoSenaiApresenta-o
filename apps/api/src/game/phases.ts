import type { PhaseAnswer, PublicPhase } from "@error/shared";

export interface InternalPhase {
  public: PublicPhase;
  explanation: string;
  validate: (answer: PhaseAnswer) => boolean;
}

const choiceIs = (answer: PhaseAnswer, choiceId: string): boolean =>
  answer.kind === "choice" && answer.choiceId === choiceId;

const sameOrder = (left: string[], right: string[]): boolean =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const sameSet = (left: string[], right: string[]): boolean => {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
};

/** Normaliza texto para comparação tolerante a caixa, acentos e pontuação. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const PHASES: InternalPhase[] = [
  {
    public: {
      id: "botao-da-cor",
      number: 1,
      total: 12,
      kind: "choice",
      eyebrow: "CALIBRAÇÃO",
      prompt: "APERTE O BOTÃO VERMELHO.",
      note: "Leia de novo. A resposta óbvia costuma ser a armadilha.",
      columns: 2,
      choices: [
        {
          id: "botao",
          label: "BOTÃO",
          surface: "danger",
          labelTone: "void",
          size: "lg",
        },
        {
          id: "vermelho",
          label: "VERMELHO",
          surface: "panel",
          labelTone: "danger",
          size: "lg",
        },
      ],
    },
    explanation:
      "O botão vermelho era o que tinha a palavra VERMELHO escrita nele. A instrução podia falar da cor — ou do texto. Desta vez, falava do texto.",
    validate: (answer) => choiceIs(answer, "vermelho"),
  },
  {
    public: {
      id: "nao-clique",
      number: 2,
      total: 12,
      kind: "outside",
      eyebrow: "PROTOCOLO 02",
      prompt: "NÃO CLIQUE EM NENHUM BOTÃO.",
      note: "A área fora do painel também está ouvindo. Escape confirma no teclado.",
      panelTitle: "PAINEL DE CONTROLE",
      decoys: [
        { id: "clique-aqui", label: "CLIQUE AQUI", surface: "neon" },
        { id: "continuar", label: "CONTINUAR", surface: "panel" },
        { id: "sim", label: "SIM", surface: "danger" },
      ],
    },
    explanation:
      "Todos os botões eram iscas. Para obedecer, era preciso clicar fora do painel — ou pressionar Escape.",
    validate: (answer) => answer.kind === "outside" && answer.target === "background",
  },
  {
    public: {
      id: "tinta-nao-significado",
      number: 3,
      total: 12,
      kind: "choice",
      eyebrow: "COR / PALAVRA",
      prompt: "CLIQUE NA PALAVRA ESCRITA EM VERMELHO.",
      note: "A palavra e a tinta podem discordar.",
      columns: 3,
      choices: [
        {
          id: "verde",
          label: "VERDE",
          surface: "panel",
          labelTone: "danger",
          size: "lg",
        },
        {
          id: "vermelho",
          label: "VERMELHO",
          surface: "panel",
          labelTone: "neon",
          size: "lg",
        },
        {
          id: "azul",
          label: "AZUL",
          surface: "panel",
          labelTone: "sky",
          size: "lg",
        },
      ],
    },
    explanation:
      "A tinta de VERDE era vermelha. A pergunta pediu a cor da tinta, não o significado da palavra.",
    validate: (answer) => choiceIs(answer, "verde"),
  },
  {
    public: {
      id: "barra-cheia",
      number: 4,
      total: 12,
      kind: "wait",
      eyebrow: "TEMPO",
      prompt: "CLIQUE EM CONTINUAR QUANDO A BARRA CHEGAR AO FIM.",
      note: "Não antes. O sistema registra a pressa.",
      waitMs: 4000,
      buttonLabel: "CONTINUAR",
      waitingLabel: "AGUARDE",
      readyLabel: "CONTINUAR",
    },
    explanation:
      "A pressa era a armadilha. A barra precisava chegar ao fim antes do clique.",
    validate: (answer) =>
      answer.kind === "wait" && answer.waitedMs >= 3900,
  },
  {
    public: {
      id: "ordem-alfabetica",
      number: 5,
      total: 12,
      kind: "sequence",
      eyebrow: "SEQUÊNCIA",
      prompt: "SELECIONE AS PALAVRAS EM ORDEM ALFABÉTICA.",
      note: "A ordem dos cliques importa.",
      submitLabel: "CONFIRMAR ORDEM",
      selectedLabel: "SUA ORDEM",
      items: [
        { id: "zebra", label: "ZEBRA" },
        { id: "macaco", label: "MACACO" },
        { id: "abacaxi", label: "ABACAXI" },
        { id: "dragao", label: "DRAGÃO" },
      ],
    },
    explanation:
      "A sequência correta era ABACAXI, DRAGÃO, MACACO, ZEBRA. Nenhuma palavra era decorativa.",
    validate: (answer) =>
      answer.kind === "sequence" &&
      sameOrder(answer.order, ["abacaxi", "dragao", "macaco", "zebra"]),
  },
  {
    public: {
      id: "quatro-por-extenso",
      number: 6,
      total: 12,
      kind: "type",
      eyebrow: "ESCRITA",
      prompt: "QUANTO É 2 + 2? RESPONDA POR EXTENSO.",
      note: "A conta é fácil. A instrução também.",
      placeholder: "digite a resposta",
      submitLabel: "ENVIAR",
      maxLength: 40,
      helper: "Uma palavra. Sem algarismos.",
    },
    explanation:
      "2 + 2 é 4, mas a instrução pediu por extenso: QUATRO. Quem digitou o algarismo respondeu outra pergunta.",
    validate: (answer) =>
      answer.kind === "type" && normalizeText(answer.value) === "quatro",
  },
  {
    public: {
      id: "sem-a",
      number: 7,
      total: 12,
      kind: "drag",
      eyebrow: "DETALHE",
      prompt: "ARRASTE PARA A LIXEIRA A ÚNICA PALAVRA QUE NÃO TEM A LETRA A.",
      note: "No celular, toque na palavra e depois no destino.",
      targetLabel: "LIXEIRA",
      keepLabel: "MANTER",
      selectHint: "Selecione uma palavra e escolha um destino.",
      items: [
        { id: "casa", label: "CASA" },
        { id: "amor", label: "AMOR" },
        { id: "erro", label: "ERRO" },
        { id: "tela", label: "TELA" },
      ],
    },
    explanation:
      "ERRO era a única palavra sem a letra A. As outras quatro continham pelo menos uma.",
    validate: (answer) =>
      answer.kind === "drag" &&
      answer.itemId === "erro" &&
      answer.target === "trash",
  },
  {
    public: {
      id: "erro-na-frase",
      number: 8,
      total: 12,
      kind: "choice",
      eyebrow: "ATENÇÃO VISUAL",
      prompt: "ENCONTRE O ERRO NA FRASE: O SISTEMA ESTA FUNCIONANDO.",
      note: "O erro está escrito. Literalmente.",
      columns: 2,
      choices: [
        { id: "o", label: "O", size: "md" },
        { id: "sistema", label: "SISTEMA", size: "md" },
        { id: "esta", label: "ESTA", size: "md" },
        { id: "funcionando", label: "FUNCIONANDO", size: "md" },
      ],
    },
    explanation:
      "Faltava o acento: ESTÁ. O erro estava na palavra, não na lógica da frase.",
    validate: (answer) => choiceIs(answer, "esta"),
  },
  {
    public: {
      id: "segure-tres",
      number: 9,
      total: 12,
      kind: "hold",
      eyebrow: "PACIÊNCIA",
      prompt: "SEGURE O BOTÃO POR 3 SEGUNDOS.",
      note: "Não solte antes. O contador é honesto.",
      holdMs: 3000,
      buttonLabel: "SEGURE",
      holdingLabel: "NÃO SOLTE",
      doneLabel: "PROCESSANDO",
    },
    explanation:
      "Você não precisava esperar dez segundos. A instrução era clara: três.",
    validate: (answer) => answer.kind === "hold" && answer.heldMs >= 2900,
  },
  {
    public: {
      id: "numero-palavra",
      number: 10,
      total: 12,
      kind: "choice",
      eyebrow: "CONTRADIÇÃO",
      prompt: "CLIQUE NA OPÇÃO EM QUE O NÚMERO E A PALAVRA NÃO COMBINAM.",
      note: "Só uma opção está em desacordo consigo mesma.",
      columns: 2,
      choices: [
        { id: "3", label: "3 TRÊS", size: "md" },
        { id: "5", label: "5 CINCO", size: "md" },
        { id: "7", label: "7 OITO", size: "md" },
        { id: "9", label: "9 NOVE", size: "md" },
      ],
    },
    explanation:
      "7 não é OITO. Todas as outras opções diziam a mesma coisa de duas formas.",
    validate: (answer) => choiceIs(answer, "7"),
  },
  {
    public: {
      id: "apenas-vogais",
      number: 11,
      total: 12,
      kind: "multi",
      eyebrow: "SELEÇÃO MÚLTIPLA",
      prompt: "SELECIONE APENAS AS VOGAIS.",
      note: "Mais de uma resposta. Exatamente as certas.",
      submitLabel: "CONFIRMAR SELEÇÃO",
      selectedLabel: "SELECIONADAS",
      items: [
        { id: "e", label: "E", size: "lg" },
        { id: "r", label: "R", size: "lg" },
        { id: "o", label: "O", size: "lg" },
        { id: "a", label: "A", size: "lg" },
        { id: "x", label: "X", size: "lg" },
      ],
    },
    explanation:
      "As vogais eram E, O e A. R e X são consoantes, por mais importantes que pareçam.",
    validate: (answer) =>
      answer.kind === "multi" && sameSet(answer.selected, ["e", "o", "a"]),
  },
  {
    public: {
      id: "perder-para-vencer",
      number: 12,
      total: 12,
      kind: "choice",
      eyebrow: "FASE FINAL",
      prompt: "ÚLTIMA FASE. CLIQUE EM PERDER PARA VENCER.",
      note: "O sistema está observando se você obedece até o fim.",
      columns: 2,
      choices: [
        {
          id: "ganhar",
          label: "GANHAR",
          surface: "neon",
          labelTone: "void",
          size: "lg",
        },
        {
          id: "perder",
          label: "PERDER",
          surface: "danger",
          labelTone: "void",
          size: "lg",
        },
      ],
    },
    explanation:
      "O objetivo era vencer. A instrução mandava clicar em PERDER. Aqui, obedecer era ganhar.",
    validate: (answer) => choiceIs(answer, "perder"),
  },
];

export const TOTAL_PHASES = PHASES.length;

export function getPhase(index: number): InternalPhase | null {
  return PHASES[index] ?? null;
}

export function getPublicPhase(index: number): PublicPhase | null {
  return PHASES[index]?.public ?? null;
}

export function findPhaseByPublicId(id: string): InternalPhase | null {
  return PHASES.find((phase) => phase.public.id === id) ?? null;
}
