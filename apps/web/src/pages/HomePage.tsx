import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import type { PlayerStats, RunState } from "@error/shared";
import { useAuth } from "../features/auth/AuthContext";
import { api, ApiClientError } from "../lib/api";
import { formatNumber, formatPercent, pluralize } from "../lib/format";
import { useDocumentTitle } from "../hooks/useAppHooks";
import { Logo } from "../components/Logo";
import { Modal, Spinner } from "../components/ui";
import {
  ArrowRightIcon,
  CheckIcon,
  FlameIcon,
  LockIcon,
  PlayIcon,
  SparkIcon,
  TargetIcon,
  TrophyIcon,
  UserIcon,
} from "../components/icons";

const marquee = [
  "VOCÊ TEM CERTEZA?",
  "ERRO DE INTERPRETAÇÃO",
  "ACESSO NEGADO",
  "SISTEMA ANALISANDO",
  "VOCÊ LEU DIREITO?",
  "NÃO CONFIE NO ÓBVIO",
];

const principles = [
  {
    icon: TargetIcon,
    title: "LEIA. DE NOVO.",
    text: "A instrução está certa. A sua primeira interpretação talvez não esteja. Palavras, cores e posições importam.",
  },
  {
    icon: LockIcon,
    title: "DESCONFIE.",
    text: "O botão mais chamativo raramente é a resposta. O sistema cria armadilhas que parecem perfeitamente razoáveis.",
  },
  {
    icon: FlameIcon,
    title: "SOBREVIVA.",
    text: "Três vidas. Doze fases. Cada erro revela a lógica e cobra uma vida. Terminar sem erros é outra categoria.",
  },
];

export function HomePage() {
  useDocumentTitle("");
  const navigate = useNavigate();
  const { player, token, ready, signIn } = useAuth();

  const [nickname, setNickname] = useState("");
  const [activeRun, setActiveRun] = useState<RunState | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmNew, setConfirmNew] = useState(false);
  const nicknameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) {
      setActiveRun(null);
      setStats(null);
      return;
    }

    let cancelled = false;
    setLoadingPortal(true);

    Promise.all([api.activeRun(token), api.stats(token)])
      .then(([active, statsResponse]) => {
        if (cancelled) return;
        setActiveRun(active.run);
        setStats(statsResponse.stats);
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;
        setError(
          requestError instanceof ApiClientError
            ? requestError.message
            : "Não foi possível carregar seu perfil.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingPortal(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function startNewRun(authToken: string) {
    setStarting(true);
    setError(null);
    try {
      await api.startRun(authToken);
      navigate("/jogar");
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Não foi possível iniciar a partida.",
      );
    } finally {
      setStarting(false);
    }
  }

  async function handleSignInAndStart(event: FormEvent) {
    event.preventDefault();
    const clean = nickname.trim();

    if (clean.length < 2) {
      setError("Escolha um apelido com pelo menos 2 caracteres.");
      nicknameRef.current?.focus();
      return;
    }

    setStarting(true);
    setError(null);
    try {
      const auth = await signIn(clean);
      await api.startRun(auth.token);
      navigate("/jogar");
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setStarting(false);
    }
  }

  function handlePrimaryAction() {
    if (!player || !token) {
      nicknameRef.current?.focus();
      document.getElementById("iniciar")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (activeRun) {
      navigate("/jogar");
      return;
    }

    void startNewRun(token);
  }

  function handleNewRun() {
    if (!token) return;
    if (activeRun) {
      setConfirmNew(true);
      return;
    }
    void startNewRun(token);
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-neon/8 blur-[120px]" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:pt-20">
          <div className="animate-phase-in">
            <div className="inline-flex items-center gap-2 border border-neon/25 bg-neon/5 px-3 py-1.5 font-display text-[0.6rem] font-bold tracking-[0.26em] text-neon">
              <span className="size-1.5 animate-pulse rounded-full bg-neon shadow-[0_0_10px_#39ff14]" />
              SISTEMA DE AVALIAÇÃO DE ATENÇÃO · v1.0
            </div>

            <Logo className="mt-7 w-[min(88vw,36rem)]" label="ERROR" />

            <h1 className="mt-4 max-w-xl text-3xl leading-[1.08] text-ink sm:text-4xl">
              O SISTEMA ESTÁ TENTANDO
              <br />
              <span className="text-neon text-glow">TE ENGANAR.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              Um jogo de perguntas, pegadinhas e raciocínio lateral. A resposta
              óbvia costuma ser a armadilha. Leia com atenção — ou descubra o
              preço de não ter lido.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={starting || !ready}
                className="btn-neon min-w-52"
              >
                {starting ? (
                  <Spinner label="Iniciando" />
                ) : (
                  <PlayIcon className="size-4" />
                )}
                {player
                  ? activeRun
                    ? "Continuar partida"
                    : "Iniciar partida"
                  : "Iniciar teste"}
              </button>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("como-funciona")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn-ghost"
              >
                Como funciona
                <ArrowRightIcon className="size-4" />
              </button>
            </div>

            <div className="mt-8 grid max-w-lg grid-cols-3 divide-x divide-neon/15 border-y border-neon/15 py-4">
              {[
                ["12", "FASES"],
                ["03", "VIDAS"],
                ["01", "VERDADE"],
              ].map(([value, label]) => (
                <div key={label} className="px-4 first:pl-0 last:pr-0">
                  <p className="font-display text-2xl font-bold text-neon">{value}</p>
                  <p className="mt-1 text-[0.6rem] font-bold tracking-[0.22em] text-muted">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div id="iniciar" className="scroll-mt-24">
            <div className="hud-panel relative overflow-hidden p-5 sm:p-7">
              <div className="absolute top-0 right-0 border-l border-b border-neon/25 bg-neon/5 px-3 py-1.5 font-display text-[0.55rem] tracking-[0.2em] text-neon">
                {loadingPortal ? "CONECTANDO" : player ? "SESSÃO ATIVA" : "ACESSO"}
              </div>

              <p className="font-display text-[0.62rem] font-bold tracking-[0.28em] text-neon">
                TERMINAL DO JOGADOR
              </p>

              {!ready ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-4">
                  <Spinner label="Carregando sessão" />
                  <p className="text-xs tracking-[0.18em] text-muted">
                    RESTAURANDO SESSÃO...
                  </p>
                </div>
              ) : player ? (
                <div className="mt-6">
                  <div className="flex items-center gap-3 border border-neon/15 bg-void/45 p-3">
                    <div className="flex size-11 items-center justify-center bg-neon/12 font-display text-lg font-bold text-neon">
                      {player.nickname.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-bold tracking-[0.08em] text-ink">
                        {player.nickname}
                      </p>
                      <p className="mt-0.5 text-[0.65rem] text-muted">
                        Jogador autenticado por dispositivo
                      </p>
                    </div>
                  </div>

                  {activeRun ? (
                    <div className="mt-4 border border-neon/25 bg-neon/5 p-4">
                      <p className="text-[0.6rem] font-bold tracking-[0.22em] text-neon">
                        PARTIDA PAUSADA
                      </p>
                      <p className="mt-2 font-display text-xl text-ink">
                        FASE {String(activeRun.currentPhaseIndex + 1).padStart(2, "0")} /{" "}
                        {String(activeRun.totalPhases).padStart(2, "0")}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                        <span>{formatNumber(activeRun.score)} pts</span>
                        <span>{activeRun.lives} vidas</span>
                        <span>{activeRun.correctCount} acertos</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate("/jogar")}
                        className="btn-neon mt-4 w-full"
                      >
                        Continuar agora <ArrowRightIcon className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 border border-muted/20 bg-void/40 p-4">
                      <p className="text-[0.6rem] font-bold tracking-[0.22em] text-muted">
                        SISTEMA PRONTO
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted">
                        Nenhuma partida em andamento.{" "}
                        {stats?.games
                          ? `${stats.games} ${pluralize(stats.games, "partida registrada", "partidas registradas")}.`
                          : "O primeiro teste é o mais honesto."}
                      </p>
                      <button
                        type="button"
                        onClick={handleNewRun}
                        disabled={starting}
                        className="btn-neon mt-4 w-full"
                      >
                        {starting ? <Spinner /> : <PlayIcon className="size-4" />}
                        Iniciar partida
                      </button>
                    </div>
                  )}

                  {activeRun ? (
                    <button
                      type="button"
                      onClick={handleNewRun}
                      disabled={starting}
                      className="mt-3 w-full text-center text-[0.62rem] font-bold tracking-[0.18em] text-muted uppercase transition-colors hover:text-alert"
                    >
                      Abandonar e começar de novo
                    </button>
                  ) : null}

                  {stats ? (
                    <div className="mt-5 grid grid-cols-3 gap-2 border-t border-neon/10 pt-4">
                      <div>
                        <p className="text-[0.55rem] tracking-[0.16em] text-muted">RECORDE</p>
                        <p className="mt-1 font-display text-lg text-neon">
                          {formatNumber(stats.bestScore)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.55rem] tracking-[0.16em] text-muted">PARTIDAS</p>
                        <p className="mt-1 font-display text-lg text-ink">
                          {formatNumber(stats.games)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.55rem] tracking-[0.16em] text-muted">PRECISÃO</p>
                        <p className="mt-1 font-display text-lg text-ink">
                          {formatPercent(stats.accuracy)}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <form className="mt-6" onSubmit={handleSignInAndStart}>
                  <p className="text-sm leading-relaxed text-muted">
                    Escolha um apelido. Sem e-mail, sem senha, sem tutorial longo.
                    Sua sessão fica vinculada a este dispositivo.
                  </p>
                  <label
                    htmlFor="nickname"
                    className="mt-5 block text-[0.62rem] font-bold tracking-[0.22em] text-muted uppercase"
                  >
                    Seu apelido
                  </label>
                  <input
                    ref={nicknameRef}
                    id="nickname"
                    name="nickname"
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    maxLength={20}
                    minLength={2}
                    autoComplete="nickname"
                    spellCheck={false}
                    placeholder="ex.: leitor_atento"
                    className="field mt-2"
                    aria-describedby="nickname-help"
                  />
                  <p id="nickname-help" className="mt-2 text-[0.65rem] text-muted">
                    2 a 20 caracteres. Evite seu nome completo.
                  </p>
                  <button
                    type="submit"
                    disabled={starting}
                    className="btn-neon mt-5 w-full"
                  >
                    {starting ? <Spinner /> : <UserIcon className="size-4" />}
                    Autenticar e iniciar
                  </button>
                  <div className="mt-4 flex items-start gap-2 text-[0.65rem] leading-relaxed text-muted">
                    <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-neon" />
                    <span>
                      Suas partidas e recordes ficam salvos no ranking. Nenhuma
                      senha é necessária.
                    </span>
                  </div>
                </form>
              )}

              {error ? (
                <p role="alert" className="mt-4 border-l-2 border-alert pl-3 text-xs leading-relaxed text-alert">
                  {error}
                </p>
              ) : null}

              <div className="mt-6 border-t border-neon/10 pt-4 font-mono text-[0.62rem] leading-relaxed text-muted/80">
                <p>
                  <span className="text-neon">&gt;</span> integridade do sistema:{" "}
                  <span className="text-neon">instável</span>
                </p>
                <p>
                  <span className="text-neon">&gt;</span> instrução disponível:{" "}
                  <span className="text-neon">sim</span>
                </p>
                <p>
                  <span className="text-neon">&gt;</span> confiança recomendada:{" "}
                  <span className="text-alert">zero</span>
                  <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-neon align-middle" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-neon/10 bg-neon/[0.025] py-3">
        <div className="flex w-max animate-marquee items-center gap-8">
          {[...marquee, ...marquee].map((phrase, index) => (
            <span
              key={`${phrase}-${index}`}
              className="flex items-center gap-8 font-display text-[0.62rem] font-bold tracking-[0.28em] text-muted/70"
            >
              {phrase}
              <span className="size-1 bg-neon/50" aria-hidden />
            </span>
          ))}
        </div>
      </div>

      <section id="como-funciona" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="font-display text-[0.62rem] font-bold tracking-[0.34em] text-neon">
            PROTOCOLO DE TESTE
          </p>
          <h2 className="mt-4 text-3xl text-ink sm:text-4xl">
            A resposta certa não parece certa.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Cada fase testa uma forma diferente de atenção. Você pode errar —
            mas vai entender por quê. Três erros encerram a partida.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {principles.map((item, index) => (
            <article key={item.title} className="hud-panel group p-6 transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center border border-neon/30 bg-neon/8 text-neon">
                  <item.icon className="size-5" />
                </span>
                <span className="font-display text-3xl font-bold text-neon/10 transition-colors group-hover:text-neon/20">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-6 font-display text-lg text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="hud-panel p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <TrophyIcon className="size-5 text-neon" />
              <p className="font-display text-xs font-bold tracking-[0.22em] text-neon">
                O QUE ESTÁ EM JOGO
              </p>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="font-display text-base text-ink">Pontuação</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Acertos valem pontos, com bônus por velocidade e sequência.
                  Errar zera a fase e custa uma vida.
                </p>
              </div>
              <div>
                <p className="font-display text-base text-ink">Ranking</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  O melhor resultado de cada jogador entra no ranking global.
                  Sem erros, você entra para outra categoria.
                </p>
              </div>
              <div>
                <p className="font-display text-base text-ink">Aprendizado</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Cada resposta revela a lógica da pegadinha. A fase seguinte não
                  avisa qual será o próximo padrão.
                </p>
              </div>
              <div>
                <p className="font-display text-base text-ink">PWA</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Instale o ERROR no celular ou computador. A interface abre em
                  tela cheia, como um aplicativo.
                </p>
              </div>
            </div>
          </div>

          <div className="hud-panel relative flex flex-col justify-between overflow-hidden p-6 sm:p-8">
            <div className="absolute -top-10 -right-10 size-40 rounded-full bg-neon/10 blur-3xl" />
            <div>
              <SparkIcon className="size-6 text-neon" />
              <p className="mt-4 font-display text-sm font-bold tracking-[0.16em] text-neon">
                AINDA ACHANDO QUE É FÁCIL?
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                A primeira fase é simples. A segunda também. É exatamente assim
                que o sistema ganha confiança.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={starting || !ready}
              className="btn-neon mt-8 w-full"
            >
              {starting ? <Spinner /> : <PlayIcon className="size-4" />}
              {activeRun ? "Continuar partida" : "Aceitar o teste"}
            </button>
          </div>
        </div>
      </section>

      <Modal
        open={confirmNew}
        title="Abandonar a partida atual?"
        onClose={() => setConfirmNew(false)}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setConfirmNew(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                setConfirmNew(false);
                if (token) void startNewRun(token);
              }}
            >
              Abandonar e iniciar
            </button>
          </>
        }
      >
        O progresso da partida em andamento será marcado como abandonado. Seu
        recorde anterior continua no ranking.
      </Modal>
    </>
  );
}
