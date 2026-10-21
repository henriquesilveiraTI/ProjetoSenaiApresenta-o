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
  FlameIcon,
  LockIcon,
  PlayIcon,
  TargetIcon,
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
    text: "A resposta está na instrução. Leia com calma.",
  },
  {
    icon: LockIcon,
    title: "DESCONFIE.",
    text: "O óbvio costuma ser a armadilha.",
  },
  {
    icon: FlameIcon,
    title: "SOBREVIVA.",
    text: "12 fases, 3 vidas. Cada erro custa uma.",
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
            <Logo className=" w-[min(88vw,36rem)]" label="ERROR" />

            <h1 className="mt-4 max-w-xl text-3xl leading-[1.08] text-ink sm:text-4xl">
              O SISTEMA ESTÁ TENTANDO
              <br />
              <span className="text-neon text-glow">TE ENGANAR.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              Um jogo de pegadinhas. Leia com atenção.
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
                  <label
                    htmlFor="nickname"
                    className="block text-[0.62rem] font-bold tracking-[0.22em] text-muted uppercase"
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
                    2 a 20 caracteres. Sem senha.
                  </p>
                  <button
                    type="submit"
                    disabled={starting}
                    className="btn-neon mt-5 w-full"
                  >
                    {starting ? <Spinner /> : <UserIcon className="size-4" />}
                    Jogar
                  </button>
                </form>
              )}

              {error ? (
                <p role="alert" className="mt-4 border-l-2 border-alert pl-3 text-xs leading-relaxed text-alert">
                  {error}
                </p>
              ) : null}

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

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={starting || !ready}
            className="btn-neon min-w-52"
          >
            {starting ? <Spinner /> : <PlayIcon className="size-4" />}
            {activeRun ? "Continuar partida" : "Aceitar o teste"}
          </button>
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
