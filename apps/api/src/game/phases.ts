import type { PhaseAnswer, PublicPhase } from "@error/shared";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/** Fase sem posição: número e total dependem do sorteio de cada partida. */
export type PhaseSpec = DistributiveOmit<PublicPhase, "number" | "total">;

export interface InternalPhase {
  public: PhaseSpec;
  explanation: string;
  validate: (answer: PhaseAnswer) => boolean;
}

/** Quantas fases cada partida sorteia do banco. */
export const PHASES_PER_RUN = 12;

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
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const PHASES: InternalPhase[] = [
  {
    public: {
      id: "botao-da-cor",
      kind: "choice",
      eyebrow: "AQUECIMENTO",
      prompt: "APERTA O BOTÃO VERMELHO.",
      note: "Lê de novo, com calma. O óbvio aqui é cilada.",
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
      "O botão \"vermelho\" era o que tinha VERMELHO escrito. Foi na cor do fundo, né? A gente sabia kkkk",
    validate: (answer) => choiceIs(answer, "vermelho"),
  },
  {
    public: {
      id: "nao-clique",
      kind: "outside",
      eyebrow: "AUTOCONTROLE",
      prompt: "NÃO CLICA EM NENHUM BOTÃO.",
      note: "Fora do painel também conta. No teclado, o Esc resolve.",
      panelTitle: "PAINEL DE CONTROLE",
      decoys: [
        { id: "clique-aqui", label: "CLICA AQUI", surface: "neon" },
        { id: "continuar", label: "CONTINUAR", surface: "panel" },
        { id: "sim", label: "CONFIA", surface: "danger" },
      ],
    },
    explanation:
      "Todo botão ali era isca. Era só clicar fora do painel (ou apertar Esc). Dedinho nervoso, hein?",
    validate: (answer) => answer.kind === "outside" && answer.target === "background",
  },
  {
    public: {
      id: "tinta-nao-significado",
      kind: "choice",
      eyebrow: "COR OU PALAVRA?",
      prompt: "CLICA NA PALAVRA ESCRITA EM VERMELHO.",
      note: "O que tá escrito e a cor da letra nem sempre combinam.",
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
      "VERDE tava escrito em vermelho. A pergunta era sobre a cor da letra, não sobre o que a palavra diz. Cérebro bugou, normal.",
    validate: (answer) => choiceIs(answer, "verde"),
  },
  {
    public: {
      id: "barra-cheia",
      kind: "wait",
      eyebrow: "PACIÊNCIA",
      prompt: "CLICA EM CONTINUAR SÓ QUANDO A BARRA ENCHER.",
      note: "Nem um segundo antes. O sistema tá vendo sua ansiedade.",
      waitMs: 4000,
      buttonLabel: "CONTINUAR",
      waitingLabel: "SEGURA AÍ",
      readyLabel: "CONTINUAR",
    },
    explanation:
      "A pressa era a pegadinha. Tinha que esperar a barra encher inteirinha. Respira.",
    validate: (answer) =>
      answer.kind === "wait" && answer.waitedMs >= 3900,
  },
  {
    public: {
      id: "ordem-alfabetica",
      kind: "sequence",
      eyebrow: "ABC",
      prompt: "TOCA NAS PALAVRAS EM ORDEM ALFABÉTICA.",
      note: "A ordem dos toques importa, sem caô.",
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
      "Era ABACAXI, DRAGÃO, MACACO, ZEBRA. Alfabeto de prézinho, mas na pressão pega, né?",
    validate: (answer) =>
      answer.kind === "sequence" &&
      sameOrder(answer.order, ["abacaxi", "dragao", "macaco", "zebra"]),
  },
  {
    public: {
      id: "quatro-por-extenso",
      kind: "type",
      eyebrow: "MATEMÁTICA?",
      prompt: "QUANTO É 2 + 2? RESPONDE POR EXTENSO.",
      note: "A conta é fácil. Lê a instrução inteira, por favor.",
      placeholder: "manda a resposta",
      submitLabel: "ENVIAR",
      maxLength: 40,
      helper: "Uma palavra só. Nada de número.",
    },
    explanation:
      "2 + 2 é 4, mas era por extenso: QUATRO. Quem digitou o número respondeu outra pergunta, fato.",
    validate: (answer) =>
      answer.kind === "type" && normalizeText(answer.value) === "quatro",
  },
  {
    public: {
      id: "sem-a",
      kind: "drag",
      eyebrow: "OLHO VIVO",
      prompt: "ARRASTA PRA LIXEIRA A ÚNICA PALAVRA SEM A LETRA A.",
      note: "No celular: toca na palavra e depois no destino.",
      targetLabel: "LIXEIRA",
      keepLabel: "DEIXAR",
      selectHint: "Escolhe uma palavra e depois o destino.",
      items: [
        { id: "casa", label: "CASA" },
        { id: "amor", label: "AMOR" },
        { id: "erro", label: "ERRO" },
        { id: "tela", label: "TELA" },
      ],
    },
    explanation:
      "ERRO era a única sem A. As outras três tinham pelo menos um. Ironia? Talvez.",
    validate: (answer) =>
      answer.kind === "drag" &&
      answer.itemId === "erro" &&
      answer.target === "trash",
  },
  {
    public: {
      id: "erro-na-frase",
      kind: "choice",
      eyebrow: "MODO REVISOR",
      prompt: "ACHA O ERRO NA FRASE: O SISTEMA ESTA FUNCIONANDO.",
      note: "O erro tá escrito. Literalmente.",
      columns: 2,
      choices: [
        { id: "o", label: "O", size: "md" },
        { id: "sistema", label: "SISTEMA", size: "md" },
        { id: "esta", label: "ESTA", size: "md" },
        { id: "funcionando", label: "FUNCIONANDO", size: "md" },
      ],
    },
    explanation:
      "Faltou o acento: é ESTÁ. O erro tava na palavra, não no sentido da frase. Sua prof de português ficaria orgulhosa.",
    validate: (answer) => choiceIs(answer, "esta"),
  },
  {
    public: {
      id: "segure-tres",
      kind: "hold",
      eyebrow: "RESISTÊNCIA",
      prompt: "SEGURA O BOTÃO POR 3 SEGUNDOS.",
      note: "Soltou antes, zerou. Sem choro.",
      holdMs: 3000,
      buttonLabel: "SEGURA",
      holdingLabel: "NÃO SOLTA",
      doneLabel: "PROCESSANDO",
    },
    explanation:
      "Era só segurar 3 segundinhos sem soltar. Soltou antes, o contador voltava pro zero.",
    validate: (answer) => answer.kind === "hold" && answer.heldMs >= 2900,
  },
  {
    public: {
      id: "numero-palavra",
      kind: "choice",
      eyebrow: "TEM ALGO ERRADO",
      prompt: "CLICA NA OPÇÃO ONDE O NÚMERO E A PALAVRA NÃO BATEM.",
      note: "Só uma tá de mal consigo mesma.",
      columns: 2,
      choices: [
        { id: "3", label: "3 TRÊS", size: "md" },
        { id: "5", label: "5 CINCO", size: "md" },
        { id: "7", label: "7 OITO", size: "md" },
        { id: "9", label: "9 NOVE", size: "md" },
      ],
    },
    explanation:
      "7 não é OITO, né. As outras falavam a mesma coisa de dois jeitos.",
    validate: (answer) => choiceIs(answer, "7"),
  },
  {
    public: {
      id: "apenas-vogais",
      kind: "multi",
      eyebrow: "SELEÇÃO",
      prompt: "SELECIONA SÓ AS VOGAIS.",
      note: "Pode marcar mais de uma. Só as certas, hein.",
      submitLabel: "CONFIRMAR",
      selectedLabel: "MARCADAS",
      items: [
        { id: "e", label: "E", size: "lg" },
        { id: "r", label: "R", size: "lg" },
        { id: "o", label: "O", size: "lg" },
        { id: "a", label: "A", size: "lg" },
        { id: "x", label: "X", size: "lg" },
      ],
    },
    explanation:
      "As vogais eram E, O e A. R e X são consoantes, não adianta insistir.",
    validate: (answer) =>
      answer.kind === "multi" && sameSet(answer.selected, ["e", "o", "a"]),
  },
  {
    public: {
      id: "perder-para-vencer",
      kind: "choice",
      eyebrow: "PLOT TWIST",
      prompt: "CLICA EM PERDER PRA GANHAR.",
      note: "Confia no processo.",
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
      "Você queria ganhar, mas a instrução mandava clicar em PERDER. Aqui, obedecer era ganhar.",
    validate: (answer) => choiceIs(answer, "perder"),
  },
  {
    public: {
      id: "meses-28-dias",
      kind: "choice",
      eyebrow: "CALENDÁRIO",
      prompt: "QUANTOS MESES DO ANO TÊM 28 DIAS?",
      note: "Não é sobre fevereiro. Ou é?",
      columns: 2,
      choices: [
        { id: "1", label: "1", size: "lg" },
        { id: "2", label: "2", size: "lg" },
        { id: "12", label: "12", size: "lg" },
        { id: "nenhum", label: "NENHUM", size: "lg" },
      ],
    },
    explanation:
      "Todos os 12 têm 28 dias. A maioria só tem uns diazinhos a mais. Fevereiro não é o único, não.",
    validate: (answer) => choiceIs(answer, "12"),
  },
  {
    public: {
      id: "aviao-fronteira",
      kind: "choice",
      eyebrow: "GEOGRAFIA?",
      prompt:
        "UM AVIÃO CAIU NA FRONTEIRA DO BRASIL COM A ARGENTINA. ONDE ENTERRAM OS SOBREVIVENTES?",
      note: "Lê cada palavra. Cada uma.",
      columns: 2,
      choices: [
        { id: "brasil", label: "NO BRASIL", size: "md" },
        { id: "argentina", label: "NA ARGENTINA", size: "md" },
        { id: "fronteira", label: "NA FRONTEIRA", size: "md" },
        { id: "nenhum", label: "EM LUGAR NENHUM", size: "md" },
      ],
    },
    explanation:
      "Ninguém enterra sobrevivente, né? A pessoa tá viva! Se você pensou em geografia, caiu bonito.",
    validate: (answer) => choiceIs(answer, "nenhum"),
  },
  {
    public: {
      id: "corrida-segundo",
      kind: "choice",
      eyebrow: "CORRIDA",
      prompt: "VOCÊ TÁ NUMA CORRIDA E ULTRAPASSA QUEM TÁ EM 2º. EM QUE POSIÇÃO VOCÊ FICA?",
      note: "Imagina a cena antes de clicar.",
      columns: 2,
      choices: [
        { id: "1", label: "1º LUGAR", size: "md" },
        { id: "2", label: "2º LUGAR", size: "md" },
        { id: "3", label: "3º LUGAR", size: "md" },
        { id: "ultimo", label: "ÚLTIMO", size: "md" },
      ],
    },
    explanation:
      "Passou o 2º? Você virou o 2º. Pra ser o 1º tinha que passar o primeiro. Clássico dos clássicos.",
    validate: (answer) => choiceIs(answer, "2"),
  },
  {
    public: {
      id: "algodao-ferro",
      kind: "choice",
      eyebrow: "FÍSICA DE BOTECO",
      prompt: "O QUE PESA MAIS: 1 KG DE ALGODÃO OU 1 KG DE FERRO?",
      note: "Sua intuição tá doida pra responder. Segura.",
      columns: 3,
      choices: [
        { id: "algodao", label: "ALGODÃO", size: "md" },
        { id: "ferro", label: "FERRO", size: "md" },
        { id: "igual", label: "PESAM IGUAL", size: "md" },
      ],
    },
    explanation:
      "1 kg é 1 kg, mano. O ferro só parece mais pesado na sua cabeça.",
    validate: (answer) => choiceIs(answer, "igual"),
  },
  {
    public: {
      id: "moises-arca",
      kind: "choice",
      eyebrow: "CONHECIMENTOS GERAIS",
      prompt: "QUANTOS ANIMAIS DE CADA ESPÉCIE MOISÉS LEVOU NA ARCA?",
      note: "Confere quem é quem na história.",
      columns: 2,
      choices: [
        { id: "1", label: "1", size: "lg" },
        { id: "2", label: "2", size: "lg" },
        { id: "7", label: "7", size: "lg" },
        { id: "nenhum", label: "NENHUM", size: "lg" },
      ],
    },
    explanation:
      "Quem construiu a arca foi Noé, não Moisés. Seu cérebro autocompletou sem pedir permissão.",
    validate: (answer) => choiceIs(answer, "nenhum"),
  },
  {
    public: {
      id: "cavalo-napoleao",
      kind: "type",
      eyebrow: "HISTÓRIA",
      prompt: "QUAL ERA A COR DO CAVALO BRANCO DE NAPOLEÃO?",
      note: "Não pensa demais.",
      placeholder: "manda a cor",
      submitLabel: "ENVIAR",
      maxLength: 40,
      helper: "Uma palavra resolve.",
    },
    explanation:
      "A resposta tava na pergunta: BRANCO. Às vezes não tem pegadinha... e essa é a pegadinha.",
    validate: (answer) =>
      answer.kind === "type" &&
      normalizeText(answer.value)
        .split(" ")
        .some((word) => word === "branco" || word === "branca"),
  },
  {
    public: {
      id: "balde-furo",
      kind: "choice",
      eyebrow: "LIFE HACK",
      prompt: "O QUE VOCÊ COLOCA NUM BALDE CHEIO D'ÁGUA PRA DEIXAR ELE MAIS LEVE?",
      note: "Colocar, não tirar. Pensa fora da caixa.",
      columns: 2,
      choices: [
        { id: "gelo", label: "GELO", size: "md" },
        { id: "oleo", label: "ÓLEO", size: "md" },
        { id: "ar", label: "AR", size: "md" },
        { id: "furo", label: "UM FURO", size: "md" },
      ],
    },
    explanation:
      "Um furo! A água vaza e o balde fica mais leve. Física raiz.",
    validate: (answer) => choiceIs(answer, "furo"),
  },
  {
    public: {
      id: "pares-com-zero",
      kind: "multi",
      eyebrow: "PAR OU ÍMPAR",
      prompt: "SELECIONA TODOS OS NÚMEROS PARES.",
      note: "Todos mesmo. Até aquele que você acha que não conta.",
      submitLabel: "CONFIRMAR",
      selectedLabel: "MARCADOS",
      items: [
        { id: "2", label: "2", size: "lg" },
        { id: "7", label: "7", size: "lg" },
        { id: "0", label: "0", size: "lg" },
        { id: "10", label: "10", size: "lg" },
        { id: "13", label: "13", size: "lg" },
      ],
    },
    explanation:
      "2, 10 e... 0! Zero é par sim, pode pesquisar. Esqueceu dele? Normal, mas não conta.",
    validate: (answer) =>
      answer.kind === "multi" && sameSet(answer.selected, ["2", "0", "10"]),
  },
  {
    public: {
      id: "fracoes-ordem",
      kind: "sequence",
      eyebrow: "MENOR PRO MAIOR",
      prompt: "ORDENA DO MENOR PRO MAIOR.",
      note: "Fração e decimal na mesma fila. Faz a conta.",
      submitLabel: "CONFIRMAR ORDEM",
      selectedLabel: "SUA ORDEM",
      items: [
        { id: "meio", label: "1/2" },
        { id: "zero-tres", label: "0,3" },
        { id: "quarto", label: "1/4" },
        { id: "zero-nove", label: "0,9" },
      ],
    },
    explanation:
      "1/4 é 0,25, então vem antes do 0,3. Depois 1/2 (0,5) e 0,9. Fração disfarçada pega muita gente.",
    validate: (answer) =>
      answer.kind === "sequence" &&
      sameOrder(answer.order, ["quarto", "zero-tres", "meio", "zero-nove"]),
  },
  {
    public: {
      id: "nao-e-fruta",
      kind: "drag",
      eyebrow: "BIOLOGIA",
      prompt: "ARRASTA PRA LIXEIRA O QUE NÃO É FRUTA.",
      note: "Fruta de verdade, de biologia. Não de salada de fruta.",
      targetLabel: "LIXEIRA",
      keepLabel: "DEIXAR",
      selectHint: "Escolhe um item e depois o destino.",
      items: [
        { id: "tomate", label: "TOMATE" },
        { id: "abacate", label: "ABACATE" },
        { id: "cenoura", label: "CENOURA" },
        { id: "pimentao", label: "PIMENTÃO" },
      ],
    },
    explanation:
      "Tomate, abacate e pimentão são frutos sim (a biologia confirma). A intrusa era a CENOURA, que é raiz.",
    validate: (answer) =>
      answer.kind === "drag" &&
      answer.itemId === "cenoura" &&
      answer.target === "trash",
  },
];

export function findPhaseByPublicId(id: string): InternalPhase | null {
  return PHASES.find((phase) => phase.public.id === id) ?? null;
}

/** Sorteia, sem repetir, as fases de uma nova partida (Fisher–Yates). */
export function drawPhaseIds(
  count = PHASES_PER_RUN,
  random: () => number = Math.random,
): string[] {
  const ids = PHASES.map((phase) => phase.public.id);
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [ids[index], ids[swap]] = [ids[swap]!, ids[index]!];
  }
  return ids.slice(0, Math.min(count, ids.length));
}

/** Monta a especificação pública com a posição da fase dentro da partida. */
export function toPublicPhase(
  phase: InternalPhase,
  index: number,
  total: number,
): PublicPhase {
  return { ...phase.public, number: index + 1, total } as PublicPhase;
}
