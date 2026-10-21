# ERROR — Contextualização do Projeto

## 1. Visão geral

**ERROR** é um jogo de perguntas, pegadinhas e raciocínio lateral baseado em enganar as expectativas do jogador. O objetivo não é simplesmente responder perguntas de conhecimento geral, mas interpretar instruções, observar detalhes e desconfiar da resposta que parece óbvia.

O jogo se inspira no estilo de desafios inesperados de *The Impossible Quiz*, mas deve ter identidade própria, com situações, perguntas, textos, mecânicas e apresentação originais.

A experiência deve provocar reações como: “eu sabia!”, “como eu não percebi isso?” e “o jogo está tentando me enganar”.

## 2. Mecânica central

Cada fase apresenta uma pergunta ou instrução curta e uma ou mais formas de interação. A pegadinha pode estar no texto, na cor, na posição, na ordem, no significado das palavras ou no comportamento esperado do jogador.

### Exemplo de fase

O texto na tela diz:

**“Aperte o botão vermelho.”**

A tela apresenta dois botões:

- Um botão com fundo vermelho e a palavra **“BOTÃO”** escrita nele.
- Um botão com fundo preto e a palavra **“VERMELHO”** escrita nele.

O jogador precisa perceber que a instrução pode se referir à palavra escrita, e não à cor do botão. Assim, a alternativa aparentemente errada pode ser a correta.

Essa é apenas uma demonstração da lógica do jogo. As fases podem explorar outros tipos de ambiguidade e não devem repetir sempre a mesma fórmula.

## 3. Princípios de design das fases

- **Enganar sem ser aleatório:** a resposta correta deve fazer sentido quando o jogador entende a pegadinha.
- **Questionar o óbvio:** a primeira resposta que vem à mente nem sempre será a correta.
- **Observar os detalhes:** cores, palavras, pontuação, posição e instruções podem ser importantes.
- **Variar as mecânicas:** combinar perguntas, escolhas, cliques, sequências, temporizadores e interações inesperadas.
- **Aprender com os erros:** quando errar, o jogador deve entender a lógica da pegadinha, sem necessariamente receber uma explicação longa.
- **Manter a surpresa:** não revelar antecipadamente o padrão das próximas fases.
- **Evitar injustiça gratuita:** desafios difíceis são bem-vindos, mas devem possuir uma lógica identificável após a solução.

## 4. Identidade visual

A interface segue uma estética **cyberpunk sombria**, com aparência de sistema digital instável ou terminal corrompido.

### Paleta principal

- Preto profundo: `#070909`
- Preto secundário: `#0D1110`
- Grafite: `#141A17`
- Verde neon: `#39FF14`
- Verde neon claro para hover: `#65FF45`
- Verde escuro para sombras: `#0B3D0B`
- Texto principal: `#E8F2E9`
- Texto secundário: `#A0B0A4`
- Vermelho de alerta: `#FF3030`

O preto deve dominar a tela. O verde neon será usado em títulos, indicadores, progresso, elementos selecionados e ações importantes. O vermelho pode destacar perigos, erros ou elementos específicos de uma pegadinha.

### Logo

A marca utiliza o nome **ERROR** em letras maiúsculas, com verde neon, sombra ou extrusão verde-escura e fundo preto. O logotipo deve ser simples, marcante e legível, sem elementos decorativos desnecessários.

### Efeitos

Usar, com moderação:
- Brilho neon.
- Glitch e pequenas interferências digitais.
- Linhas de terminal e indicadores técnicos.
- Transições rápidas e microanimações.
- Feedback visual para acertos, erros e mudanças de fase.

Os efeitos não devem atrapalhar a leitura nem dificultar a interação.

## 5. Experiência do jogador

O jogo deve ter controles simples e começar rapidamente, sem exigir cadastro ou explicações extensas para iniciar uma partida.

Fluxo sugerido:

1. **Tela inicial:** exibe a logo ERROR, uma frase curta e o botão para iniciar.
2. **Início da partida:** apresenta a primeira fase sem tutoriais longos.
3. **Fase:** mostra a instrução e os elementos interativos.
4. **Resposta:** informa visualmente se o jogador acertou ou caiu na pegadinha.
5. **Progressão:** atualiza a fase e o progresso.
6. **Fim de jogo:** apresenta o resultado, a pontuação e a opção de tentar novamente.

A progressão pode incluir vidas, pontuação, sequência de acertos ou recorde pessoal. Esses sistemas devem ser implementados de forma simples e coerente, sem sobrecarregar a experiência inicial.

## 6. Tipos de pegadinhas possíveis

Use variedade para que o jogador não consiga prever a solução de todas as fases:

- **Ambiguidade textual:** a frase pode ser interpretada de mais de uma maneira.
- **Cor versus palavra:** o texto de um elemento contradiz sua cor.
- **Atenção visual:** um pequeno detalhe altera a resposta.
- **Raciocínio lateral:** a solução exige abandonar a interpretação convencional.
- **Ordem e sequência:** clicar na alternativa certa na ordem errada pode falhar.
- **Interação inesperada:** arrastar, esperar, clicar fora de um elemento ou executar uma ação diferente da habitual.
- **Instruções contraditórias:** o jogador precisa identificar qual parte da instrução realmente importa.
- **Elementos enganosos:** botões e textos podem parecer importantes sem serem a solução.

Esses tipos são possibilidades criativas. Cada fase deve escolher uma mecânica principal e apresentá-la com clareza suficiente para que a solução seja justa.

## 7. Regras para a IA que desenvolverá o projeto

Ao criar ou modificar o ERROR:

- Preserve o conceito central de jogo de pegadinhas e raciocínio lateral.
- Mantenha a identidade cyberpunk preta e verde neon.
- Dê prioridade à experiência de jogo, não à aparência de um dashboard administrativo.
- Crie perguntas e pegadinhas originais; use *The Impossible Quiz* apenas como referência de estilo e conceito.
- Separe a lógica das fases dos componentes visuais para facilitar a criação de novas perguntas.
- Faça com que cada fase tenha uma resposta correta definida e verificável.
- Evite respostas aleatórias ou soluções que dependam de bugs.
- Implemente estados claros para início, fase ativa, acerto, erro, pausa e fim de jogo, conforme necessário.
- Garanta que botões e interações funcionem de verdade.
- Mantenha o layout responsivo para computadores e celulares.
- Use HTML semântico, foco visível e controles acessíveis por teclado sempre que possível.
- Evite dependências desnecessárias e respeite a arquitetura e as tecnologias já existentes no repositório.
- Antes de alterar arquivos, inspecione a estrutura do projeto e reutilize o que já estiver funcionando.
- Não substitua funcionalidades existentes sem necessidade; explique mudanças importantes e mantenha o código organizado.

## 8. Direção de tom e textos

A linguagem do jogo deve ser curta, provocativa e levemente sarcástica. O sistema pode parecer que está testando a atenção do jogador.

Exemplos de textos de ambientação:
- `VOCÊ TEM CERTEZA?`
- `ERRO DE INTERPRETAÇÃO`
- `ACESSO NEGADO`
- `SISTEMA ANALISANDO...`
- `VOCÊ LEU DIREITO?`
- `PRÓXIMA FASE: NÃO CONFIE NO ÓBVIO`

Essas frases são referências de tom, não textos obrigatórios para todas as telas.

## 9. Objetivo final

Criar um jogo web divertido, rápido de entender e difícil de dominar, em que cada fase desafia o jogador a prestar atenção, interpretar instruções de maneira diferente e desconfiar das respostas óbvias.

**A essência do ERROR é simples: o jogo não testa apenas o que você sabe. Ele testa como você pensa — e o quanto consegue evitar ser enganado.**
