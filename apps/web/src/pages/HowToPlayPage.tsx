import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { useDocumentTitle } from "../hooks/useAppHooks";
import { SectionHeading } from "../components/ui";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  ClockIcon,
  FlameIcon,
  LockIcon,
  PhoneIcon,
  PlayIcon,
  TargetIcon,
  TrophyIcon,
} from "../components/icons";

const rules = [
  {
    icon: TargetIcon,
    title: "Leia a instrução literalmente",
    text: "Palavras, cores, pontuação, ordem e posição podem mudar a resposta. O sistema não pede que você adivinhe: ele pede que você leia.",
  },
  {
    icon: FlameIcon,
    title: "Três vidas, doze fases",
    text: "Cada erro custa uma vida e avança a fase. Ao chegar a zero, a partida termina. Terminar sem erros é um resultado à parte.",
  },
  {
    icon: TrophyIcon,
    title: "Pontos e ranking",
    text: "Acertos valem 100 pontos, com bônus por velocidade e sequência. O melhor resultado de cada jogador entra no ranking global.",
  },
  {
    icon: LockIcon,
    title: "Aprenda com o erro",
    text: "Toda resposta revela a lógica da pegadinha. A explicação não é uma recompensa: é o sistema admitindo o que fez.",
  },
];

const mechanics = [
  "Escolher uma alternativa",
  "Clicar fora de um painel",
  "Esperar uma barra carregar",
  "Selecionar itens em ordem",
  "Digitar uma resposta",
  "Arrastar ou tocar para mover",
  "Segurar um botão",
  "Selecionar mais de um item",
];

export function HowToPlayPage() {
  useDocumentTitle("Como jogar");
  const { player } = useAuth();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="MANUAL DE SOBREVIVÊNCIA"
        title="COMO JOGAR SEM CAIR EM TODAS."
        description="O ERROR não testa só conhecimento. Ele testa interpretação, atenção e a sua disposição de desconfiar da primeira resposta."
        action={
          <Link to={player ? "/jogar" : "/#iniciar"} className="btn-neon">
            <PlayIcon className="size-4" /> {player ? "Iniciar partida" : "Entrar e jogar"}
          </Link>
        }
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hud-panel p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <BookIcon className="size-5 text-neon" />
            <p className="font-display text-xs font-bold tracking-[0.22em] text-neon">
              O TESTE
            </p>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Você recebe uma instrução curta e um conjunto de elementos
            interativos. A resposta parece óbvia. Quase sempre, a obviedade é a
            armadilha. Quando a solução aparece, ela faz sentido — e é aí que a
            raiva começa.
          </p>

          <div className="mt-7 grid gap-3">
            {rules.map((rule) => (
              <div
                key={rule.title}
                className="flex gap-4 border border-neon/10 bg-void/40 p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center border border-neon/25 text-neon">
                  <rule.icon className="size-5" />
                </div>
                <div>
                  <p className="font-display text-sm text-ink">{rule.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    {rule.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 border-t border-neon/10 pt-6">
            <p className="font-display text-xs font-bold tracking-[0.2em] text-neon">
              FLUXO DE UMA PARTIDA
            </p>
            <ol className="mt-4 space-y-3">
              {[
                "Escolha um apelido. Sem cadastro, sem senha.",
                "Receba a fase e interprete a instrução.",
                "Interaja. O servidor valida a resposta.",
                "Veja o resultado, a explicação e o próximo desafio.",
                "Sobreviva às doze fases e entre para o ranking.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-muted">
                  <span className="font-display text-xs font-bold text-neon">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <div className="hud-panel p-6">
            <div className="flex items-center gap-3">
              <ClockIcon className="size-5 text-neon" />
              <p className="font-display text-xs font-bold tracking-[0.2em] text-neon">
                INTERAÇÕES POSSÍVEIS
              </p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Nem toda fase usa o mesmo gesto. Uma dica: se o óbvio não funciona,
              releia a instrução antes de concluir que o jogo quebrou.
            </p>
            <div className="mt-4 grid gap-2">
              {mechanics.map((mechanic) => (
                <div
                  key={mechanic}
                  className="flex items-center gap-2 border-l border-neon/20 pl-3 text-xs text-muted"
                >
                  <CheckIcon className="size-3.5 shrink-0 text-neon" />
                  {mechanic}
                </div>
              ))}
            </div>
          </div>

          <div className="hud-panel p-6">
            <div className="flex items-center gap-3">
              <PhoneIcon className="size-5 text-neon" />
              <p className="font-display text-xs font-bold tracking-[0.2em] text-neon">
                INSTALE COMO APP
              </p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              O ERROR é um PWA. No navegador compatível, use o convite de
              instalação ou o menu “Adicionar à tela inicial”. A interface abre
              em tela cheia e mantém os arquivos em cache; as respostas continuam
              precisando do servidor.
            </p>
            <div className="mt-4 border border-neon/15 bg-void/50 p-3 font-mono text-[0.6rem] leading-relaxed text-muted">
              <p>
                <span className="text-neon">&gt;</span> instalação:{" "}
                <span className="text-neon">disponível</span>
              </p>
              <p>
                <span className="text-neon">&gt;</span> offline:{" "}
                <span className="text-amber-300">interface apenas</span>
              </p>
              <p>
                <span className="text-neon">&gt;</span> progresso:{" "}
                <span className="text-neon">sincronizado</span>
              </p>
            </div>
          </div>

          <div className="hud-panel border-alert/25 p-6">
            <p className="font-display text-xs font-bold tracking-[0.2em] text-alert">
              ACESSIBILIDADE
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Todos os controles são acessíveis por teclado. Na fase em que é
              preciso clicar fora do painel, pressione{" "}
              <kbd className="border border-muted/35 px-1 text-ink">Esc</kbd>. Se
              você prefere menos movimento, o sistema respeita a configuração de
              movimento reduzido do seu dispositivo.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 hud-panel flex flex-col items-start justify-between gap-5 border-neon/30 p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-sm font-bold tracking-[0.18em] text-neon">
            A PARTE MAIS DIFÍCIL É COMEÇAR.
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted">
            A primeira fase é simples. A segunda também. O sistema está construindo
            confiança.
          </p>
        </div>
        <Link to={player ? "/jogar" : "/#iniciar"} className="btn-neon shrink-0">
          {player ? "Continuar" : "Iniciar teste"} <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </section>
  );
}
