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

/** Aceita a resposta digitada se alguma palavra dela estiver entre as esperadas. */
const typedOneOf = (answer: PhaseAnswer, accepted: string[]): boolean =>
  answer.kind === "type" &&
  normalizeText(answer.value)
    .split(" ")
    .some((word) => accepted.includes(word));

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
      id: "meses-letras",
      kind: "sequence",
      eyebrow: "CONTA AS LETRAS",
      prompt: "ORDENA OS MESES DO QUE TEM MENOS LETRAS PRO QUE TEM MAIS.",
      note: "Não é a ordem do calendário.",
      submitLabel: "CONFIRMAR ORDEM",
      selectedLabel: "SUA ORDEM",
      items: [
        { id: "outubro", label: "OUTUBRO" },
        { id: "maio", label: "MAIO" },
        { id: "agosto", label: "AGOSTO" },
        { id: "abril", label: "ABRIL" },
      ],
    },
    explanation:
      "MAIO (4), ABRIL (5), AGOSTO (6), OUTUBRO (7). Quem seguiu o calendário colocou ABRIL antes de MAIO e se deu mal.",
    validate: (answer) =>
      answer.kind === "sequence" &&
      sameOrder(answer.order, ["maio", "abril", "agosto", "outubro"]),
  },
  {
    public: {
      id: "noves-ate-cem",
      kind: "type",
      eyebrow: "CONTAGEM",
      prompt: "QUANTAS VEZES O ALGARISMO 9 APARECE ESCRITO DE 1 ATÉ 100?",
      note: "Conta com calma. Tem número que vale dobrado.",
      placeholder: "manda o número",
      submitLabel: "ENVIAR",
      maxLength: 40,
      helper: "Só o número.",
    },
    explanation:
      "São 20: nove nas unidades (9, 19… 89), dez de 90 a 99, e o 99 tem dois. Quase todo mundo chuta 10 ou 11.",
    validate: (answer) => typedOneOf(answer, ["20", "vinte"]),
  },
  {
    public: {
      id: "nao-e-mamifero",
      kind: "drag",
      eyebrow: "BIOLOGIA",
      prompt: "ARRASTA PRA LIXEIRA O ÚNICO QUE NÃO É MAMÍFERO.",
      note: "Tem bicho estranho aí que engana.",
      targetLabel: "LIXEIRA",
      keepLabel: "DEIXAR",
      selectHint: "Escolhe um bicho e depois o destino.",
      items: [
        { id: "baleia", label: "BALEIA" },
        { id: "morcego", label: "MORCEGO" },
        { id: "pinguim", label: "PINGUIM" },
        { id: "ornitorrinco", label: "ORNITORRINCO" },
      ],
    },
    explanation:
      "O PINGUIM é ave. Baleia, morcego e até o ornitorrinco (que bota ovo!) são mamíferos.",
    validate: (answer) =>
      answer.kind === "drag" &&
      answer.itemId === "pinguim" &&
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
      id: "ovelhas-menos-nove",
      kind: "choice",
      eyebrow: "FAZENDINHA",
      prompt: "UM FAZENDEIRO TINHA 17 OVELHAS. TODAS MENOS 9 MORRERAM. QUANTAS SOBRARAM?",
      note: "Não precisa fazer conta.",
      columns: 2,
      choices: [
        { id: "8", label: "8", size: "lg" },
        { id: "9", label: "9", size: "lg" },
        { id: "17", label: "17", size: "lg" },
        { id: "0", label: "0", size: "lg" },
      ],
    },
    explanation:
      "\"Todas menos 9 morreram\" quer dizer que 9 ficaram vivas. Quem fez 17 − 9 respondeu 8.",
    validate: (answer) => choiceIs(answer, "9"),
  },
  {
    public: {
      id: "palindromos",
      kind: "multi",
      eyebrow: "DE TRÁS PRA FRENTE",
      prompt: "SELECIONA AS PALAVRAS QUE FICAM IGUAIS LIDAS DE TRÁS PRA FRENTE.",
      note: "Letra por letra, sem pular nenhuma.",
      submitLabel: "CONFIRMAR",
      selectedLabel: "MARCADAS",
      items: [
        { id: "ovo", label: "OVO", size: "md" },
        { id: "roma", label: "ROMA", size: "md" },
        { id: "arara", label: "ARARA", size: "md" },
        { id: "sol", label: "SOL", size: "md" },
        { id: "radar", label: "RADAR", size: "md" },
        { id: "arroz", label: "ARROZ", size: "md" },
      ],
    },
    explanation:
      "OVO, ARARA e RADAR. ROMA vira AMOR, SOL vira LOS e ARROZ vira ZORRA: palavras diferentes.",
    validate: (answer) =>
      answer.kind === "multi" &&
      sameSet(answer.selected, ["ovo", "arara", "radar"]),
  },
  {
    public: {
      id: "bola-e-taco",
      kind: "choice",
      eyebrow: "CONTA DE PADARIA",
      prompt:
        "UM TACO E UMA BOLA CUSTAM R$ 1,10 JUNTOS. O TACO CUSTA R$ 1,00 A MAIS QUE A BOLA. QUANTO CUSTA A BOLA?",
      note: "A primeira resposta que vem na cabeça tá errada.",
      columns: 2,
      choices: [
        { id: "10", label: "R$ 0,10", size: "md" },
        { id: "05", label: "R$ 0,05", size: "md" },
        { id: "01", label: "R$ 0,01", size: "md" },
        { id: "100", label: "R$ 1,00", size: "md" },
      ],
    },
    explanation:
      "A bola custa R$ 0,05 e o taco R$ 1,05. Se a bola fosse R$ 0,10, o taco seria R$ 1,10 e o total daria R$ 1,20.",
    validate: (answer) => choiceIs(answer, "05"),
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
      id: "buraco-terra",
      kind: "choice",
      eyebrow: "OBRA",
      prompt: "QUANTA TERRA TEM DENTRO DE UM BURACO DE 1 METRO DE FUNDURA?",
      note: "Imagina o buraco pronto.",
      columns: 2,
      choices: [
        { id: "1m", label: "1 METRO CÚBICO", size: "md" },
        { id: "tonelada", label: "1 TONELADA", size: "md" },
        { id: "metade", label: "METADE DELE", size: "md" },
        { id: "nenhuma", label: "NENHUMA", size: "md" },
      ],
    },
    explanation:
      "Buraco é justamente o lugar de onde tiraram a terra. Dentro dele não tem nenhuma.",
    validate: (answer) => choiceIs(answer, "nenhuma"),
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
      id: "errado-dicionario",
      kind: "type",
      eyebrow: "DICIONÁRIO",
      prompt: "QUAL PALAVRA ESTÁ ESCRITA ERRADO EM TODOS OS DICIONÁRIOS?",
      note: "Os dicionários estão certos. A pergunta também.",
      placeholder: "manda a palavra",
      submitLabel: "ENVIAR",
      maxLength: 40,
      helper: "Uma palavra resolve.",
    },
    explanation:
      "A palavra \"ERRADO\" está escrita assim em todo dicionário. A resposta tava na pergunta o tempo todo.",
    validate: (answer) => typedOneOf(answer, ["errado"]),
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
  {
    public: {
      id: "galo-telhado",
      kind: "choice",
      eyebrow: "FAZENDINHA",
      prompt: "UM GALO BOTA UM OVO EM CIMA DO TELHADO. PRA QUE LADO O OVO CAI?",
      note: "Pensa no bicho, não no telhado.",
      columns: 2,
      choices: [
        { id: "esquerda", label: "PRA ESQUERDA", size: "md" },
        { id: "direita", label: "PRA DIREITA", size: "md" },
        { id: "vento", label: "PRO LADO DO VENTO", size: "md" },
        { id: "nenhum", label: "GALO NÃO BOTA OVO", size: "md" },
      ],
    },
    explanation:
      "Galo não bota ovo, quem bota é a galinha. Quem pensou no formato do telhado caiu junto com o ovo.",
    validate: (answer) => choiceIs(answer, "nenhum"),
  },
  {
    public: {
      id: "planta-lago",
      kind: "choice",
      eyebrow: "CRESCIMENTO",
      prompt:
        "UMA PLANTA DOBRA DE TAMANHO TODO DIA E COBRE O LAGO INTEIRO EM 30 DIAS. EM QUANTOS DIAS ELA COBRIU METADE?",
      note: "Dobrar não é somar.",
      columns: 2,
      choices: [
        { id: "10", label: "10 DIAS", size: "md" },
        { id: "15", label: "15 DIAS", size: "md" },
        { id: "20", label: "20 DIAS", size: "md" },
        { id: "29", label: "29 DIAS", size: "md" },
      ],
    },
    explanation:
      "No dia 29 ela cobria metade e, dobrando, no dia 30 cobriu tudo. 15 é a metade do tempo, não do lago.",
    validate: (answer) => choiceIs(answer, "29"),
  },
  {
    public: {
      id: "filhas-maria",
      kind: "choice",
      eyebrow: "FAMÍLIA",
      prompt:
        "O PAI DA MARIA TEM 5 FILHAS: LALA, LELE, LILI E LOLO. QUAL É O NOME DA QUINTA?",
      note: "O padrão é tentador.",
      columns: 2,
      choices: [
        { id: "lulu", label: "LULU", size: "md" },
        { id: "maria", label: "MARIA", size: "md" },
        { id: "lala", label: "LALA", size: "md" },
        { id: "nao-da", label: "NÃO DÁ PRA SABER", size: "md" },
      ],
    },
    explanation:
      "O pai é da MARIA. Ela é a quinta filha. O padrão das vogais foi só distração.",
    validate: (answer) => choiceIs(answer, "maria"),
  },
  {
    public: {
      id: "comprimidos",
      kind: "type",
      eyebrow: "FARMÁCIA",
      prompt:
        "VOCÊ TEM 3 COMPRIMIDOS E PRECISA TOMAR UM A CADA MEIA HORA. EM QUANTOS MINUTOS VOCÊ TOMA TODOS?",
      note: "Quando você toma o primeiro?",
      placeholder: "manda os minutos",
      submitLabel: "ENVIAR",
      maxLength: 40,
      helper: "Só o número de minutos.",
    },
    explanation:
      "60 minutos: o primeiro agora, o segundo com 30 e o terceiro com 60. Quem respondeu 90 contou um intervalo a mais.",
    validate: (answer) => typedOneOf(answer, ["60", "sessenta"]),
  },
  {
    public: {
      id: "horarios-dia",
      kind: "sequence",
      eyebrow: "RELÓGIO",
      prompt: "ORDENA DO MAIS CEDO PRO MAIS TARDE, TUDO NO MESMO DIA.",
      note: "O dia começa quando?",
      submitLabel: "CONFIRMAR ORDEM",
      selectedLabel: "SUA ORDEM",
      items: [
        { id: "12h30", label: "MEIO-DIA E MEIA" },
        { id: "13h05", label: "13H05" },
        { id: "00h15", label: "MEIA-NOITE E QUINZE" },
        { id: "11h45", label: "11H45" },
      ],
    },
    explanation:
      "Meia-noite e quinze (00h15) é o primeiro horário do dia. Depois 11h45, meio-dia e meia (12h30) e 13h05.",
    validate: (answer) =>
      answer.kind === "sequence" &&
      sameOrder(answer.order, ["00h15", "11h45", "12h30", "13h05"]),
  },
  {
    public: {
      id: "nao-e-capital",
      kind: "drag",
      eyebrow: "GEOGRAFIA",
      prompt: "ARRASTA PRA LIXEIRA A CIDADE QUE NÃO É CAPITAL DE ESTADO.",
      note: "Cidade grande e famosa não é sinônimo de capital.",
      targetLabel: "LIXEIRA",
      keepLabel: "DEIXAR",
      selectHint: "Escolhe uma cidade e depois o destino.",
      items: [
        { id: "palmas", label: "PALMAS" },
        { id: "santos", label: "SANTOS" },
        { id: "boa-vista", label: "BOA VISTA" },
        { id: "vitoria", label: "VITÓRIA" },
      ],
    },
    explanation:
      "SANTOS fica em São Paulo, mas a capital é a cidade de São Paulo. Palmas (TO), Boa Vista (RR) e Vitória (ES) são capitais.",
    validate: (answer) =>
      answer.kind === "drag" &&
      answer.itemId === "santos" &&
      answer.target === "trash",
  },
  {
    public: {
      id: "nada-verde",
      kind: "choice",
      eyebrow: "COR OU PALAVRA?",
      prompt:
        "CLICA NO ÚNICO BOTÃO SEM NADA VERDE: NEM O FUNDO, NEM A LETRA, NEM A PALAVRA.",
      note: "Confere as três coisas em cada botão.",
      columns: 2,
      choices: [
        {
          id: "azul",
          label: "AZUL",
          surface: "neon",
          labelTone: "void",
          size: "lg",
        },
        {
          id: "verde",
          label: "VERDE",
          surface: "panel",
          labelTone: "danger",
          size: "lg",
        },
        {
          id: "roxo",
          label: "ROXO",
          surface: "panel",
          labelTone: "neon",
          size: "lg",
        },
        {
          id: "amarelo",
          label: "AMARELO",
          surface: "danger",
          labelTone: "void",
          size: "lg",
        },
      ],
    },
    explanation:
      "Só AMARELO não tinha verde. AZUL tinha fundo verde, ROXO tinha letra verde e VERDE tinha a palavra.",
    validate: (answer) => choiceIs(answer, "amarelo"),
  },
  {
    public: {
      id: "proximo-numero",
      kind: "type",
      eyebrow: "SEQUÊNCIA",
      prompt: "QUAL É O PRÓXIMO NÚMERO: 1, 1, 2, 3, 5, 8, ...?",
      note: "Olha os dois números anteriores.",
      placeholder: "manda o número",
      submitLabel: "ENVIAR",
      maxLength: 40,
      helper: "Só o número.",
    },
    explanation:
      "13. Cada número é a soma dos dois anteriores: 5 + 8 = 13. É a sequência de Fibonacci.",
    validate: (answer) => typedOneOf(answer, ["13", "treze"]),
  },
  {
    public: {
      id: "anagrama-amor",
      kind: "drag",
      eyebrow: "EMBARALHADO",
      prompt:
        "ARRASTA PRA LIXEIRA A PALAVRA QUE NÃO USA EXATAMENTE AS LETRAS DE AMOR.",
      note: "Mesmas letras, mesma quantidade.",
      targetLabel: "LIXEIRA",
      keepLabel: "DEIXAR",
      selectHint: "Escolhe uma palavra e depois o destino.",
      items: [
        { id: "roma", label: "ROMA" },
        { id: "aroma", label: "AROMA" },
        { id: "ramo", label: "RAMO" },
        { id: "mora", label: "MORA" },
      ],
    },
    explanation:
      "AROMA tem um A a mais. ROMA, RAMO e MORA usam exatamente A, M, O e R.",
    validate: (answer) =>
      answer.kind === "drag" &&
      answer.itemId === "aroma" &&
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
