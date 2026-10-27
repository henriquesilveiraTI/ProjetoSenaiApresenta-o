import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import type { AnswerResult, PhaseAnswer, RunState } from "@error/shared";
import { useAuth } from "../features/auth/AuthContext";
import { api, ApiClientError } from "../lib/api";
import { formatNumber } from "../lib/format";
import { useDocumentTitle } from "../hooks/useAppHooks";
import { Logo } from "../components/Logo";
import { PhaseInteraction } from "../features/game/GamePhase";
import {
  ErrorNotice,
  LoadingScreen,
  Modal,
} from "../components/ui";
import {
  CheckIcon,
  CloseIcon,
  FlameIcon,
  LockIcon,
  PlayIcon,
  TrophyIcon,
} from "../components/icons";

function Lives({ lives, maxLives }: { lives: number; maxLives: number }) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="img"
      aria-label={`${lives} de ${maxLives} vidas restantes`}
    >
      {Array.from({ length: maxLives }, (_, index) => {
        const active = index < lives;
        return (
          <span
            key={index}
            className={[
              "h-1.5 w-7 skew-x-[-18deg] border transition-colors",
              active
                ? "border-neon/60 bg-neon shadow-[0_0_12px_rgba(57,255,20,0.35)]"
                : "border-alert/25 bg-alert/10",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}

const CORRECT_TITLES = [
  "MANDOU BEM!",
  "NÃO CAIU NESSA!",
  "CÉREBRO AFIADO!",
  "ESSA FOI FÁCIL, NÉ?",
  "ACERTOU EM CHEIO!",
];

const WRONG_TITLES = [
  "CAIU NA PEGADINHA!",
  "ESSA PEGOU VOCÊ!",
  "QUASE, MAS NÃO.",
  "NÃO FOI DESSA VEZ.",
  "A PEGADINHA VENCEU.",
];

function pickTitle(result: AnswerResult): string {
  if (result.run.status === "completed") return "PARTIDA CONCLUÍDA!";
  if (result.run.status !== "active") return "SUAS VIDAS ACABARAM.";
  const titles = result.correct ? CORRECT_TITLES : WRONG_TITLES;
  return titles[Math.floor(Math.random() * titles.length)]!;
}

function FeedbackOverlay({
  result,
  onContinue,
}: {
  result: AnswerResult;
  onContinue: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const finished = result.run.status !== "active";
  // Sorteado uma vez por resposta, para o título não trocar a cada render.
  const [title] = useState(() => pickTitle(result));

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-live="assertive"
      aria-labelledby="feedback-title"
    >
      <div
        className={`absolute inset-0 backdrop-blur-md ${
          result.correct ? "bg-void/90" : "bg-[#160909]/92"
        }`}
      />
      <div
        className={[
          "hud-panel animate-feedback-in relative w-full max-w-lg p-6 sm:p-8",
          result.correct ? "border-neon/45" : "border-alert/50",
        ].join(" ")}
      >
        <div
          className={`flex size-14 items-center justify-center border ${
            result.correct
              ? "border-neon/50 bg-neon/10 text-neon"
              : "border-alert/50 bg-alert/10 text-alert"
          }`}
        >
          {result.correct ? <CheckIcon className="size-7" /> : <CloseIcon className="size-7" />}
        </div>

        <p
          className={`mt-5 font-display text-[0.62rem] font-bold tracking-[0.3em] ${
            result.correct ? "text-neon" : "text-alert"
          }`}
        >
          {result.feedback}
        </p>
        <h2
          id="feedback-title"
          className={`mt-2 text-3xl ${result.correct ? "text-ink" : "text-alert"}`}
        >
          {title}
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-muted">
          {result.explanation}
        </p>

        <div className="mt-6 grid grid-cols-3 divide-x divide-neon/10 border-y border-neon/10 py-3 text-center">
          <div>
            <p className="text-[0.55rem] tracking-[0.16em] text-muted">PONTOS</p>
            <p
              className={`mt-1 font-display text-lg ${
                result.correct ? "text-neon" : "text-muted"
              }`}
            >
              {result.correct ? `+${formatNumber(result.points)}` : "+0"}
            </p>
          </div>
          <div>
            <p className="text-[0.55rem] tracking-[0.16em] text-muted">VIDAS</p>
            <p
              className={`mt-1 font-display text-lg ${
                result.run.lives > 0 ? "text-ink" : "text-alert"
              }`}
            >
              {result.run.lives} / {result.run.maxLives}
            </p>
          </div>
          <div>
            <p className="text-[0.55rem] tracking-[0.16em] text-muted">TOTAL</p>
            <p className="mt-1 font-display text-lg text-ink">
              {formatNumber(result.run.score)}
            </p>
          </div>
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={onContinue}
          className={`mt-6 w-full ${result.correct ? "btn-neon" : "btn-danger"}`}
        >
          {finished ? (
            <>
              <TrophyIcon className="size-4" /> Ver resultado
            </>
          ) : (
            <>
              <PlayIcon className="size-4" /> Próxima fase
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function GamePage() {
  useDocumentTitle("Partida em andamento");
  const navigate = useNavigate();
  const { token, player, ready } = useAuth();

  const [run, setRun] = useState<RunState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [abandonOpen, setAbandonOpen] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
  const [abandonError, setAbandonError] = useState<string | null>(null);

  const phaseStartRef = useRef(performance.now());
  const submittingRef = useRef(false);
  const promptRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!ready) return;

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    const authToken = token;
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const active = await api.activeRun(authToken);
        let current = active.run;

        if (!current) {
          const created = await api.startRun(authToken);
          current = created.run;
        }

        if (cancelled) return;

        if (current.status !== "active") {
          navigate(`/resultado/${current.id}`, { replace: true });
          return;
        }

        setRun(current);
        phaseStartRef.current = performance.now();
      } catch (requestError) {
        if (cancelled) return;
        setError(
          requestError instanceof ApiClientError
            ? requestError.message
            : "Não foi possível carregar a partida.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [ready, token, navigate]);

  useEffect(() => {
    if (run?.phase) {
      promptRef.current?.focus({ preventScroll: true });
    }
  }, [run?.phase?.id]);

  const answer = useCallback(
    async (payload: PhaseAnswer) => {
      if (!run?.phase || !token || submittingRef.current || result) return;

      submittingRef.current = true;
      setSubmitting(true);
      setError(null);

      const durationMs = Math.max(
        0,
        Math.round(performance.now() - phaseStartRef.current),
      );

      try {
        const response = await api.answer(token, run.id, {
          phaseId: run.phase.id,
          phaseIndex: run.currentPhaseIndex,
          answer: payload,
          durationMs,
        });
        setResult(response);
      } catch (requestError) {
        setError(
          requestError instanceof ApiClientError
            ? requestError.message
            : "A resposta não chegou ao sistema. Tente novamente.",
        );
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [run, token, result],
  );

  function continueGame() {
    if (!result) return;

    if (result.run.status === "active") {
      setRun(result.run);
      setResult(null);
      phaseStartRef.current = performance.now();
      setError(null);
      return;
    }

    navigate(`/resultado/${result.run.id}`, { replace: true });
  }

  async function abandon() {
    if (!token || !run) return;
    setAbandoning(true);
    setAbandonError(null);

    try {
      await api.abandon(token, run.id);
      navigate("/", { replace: true });
    } catch (requestError) {
      setAbandonError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Não foi possível abandonar a partida.",
      );
    } finally {
      setAbandoning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col">
        <GameTopBar />
        <LoadingScreen label="ABRINDO PROTOCOLO DE TESTE" />
      </div>
    );
  }

  if (!run || !run.phase) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-5 px-4 text-center">
        <LockIcon className="size-10 text-alert" />
        <h1 className="text-2xl text-ink">Partida indisponível</h1>
        <p className="text-sm text-muted">
          {error ?? "Não foi possível recuperar a fase atual."}
        </p>
        <Link to="/" className="btn-ghost">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const phase = run.phase;
  const progress = ((phase.number - 1) / phase.total) * 100;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-neon/12 bg-void/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo linked variant="mark" className="h-6 w-auto" />
            <span className="hidden border-l border-neon/15 pl-3 font-display text-[0.58rem] font-bold tracking-[0.22em] text-muted sm:block">
              TESTE EM ANDAMENTO
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <p className="text-[0.52rem] font-bold tracking-[0.18em] text-muted">
                PONTOS
              </p>
              <p className="font-display text-base text-neon">
                {formatNumber(run.score)}
              </p>
            </div>
            <div className="hidden sm:block">
              <p className="mb-1 text-right text-[0.52rem] font-bold tracking-[0.18em] text-muted">
                VIDAS
              </p>
              <Lives lives={run.lives} maxLives={run.maxLives} />
            </div>
            <button
              type="button"
              onClick={() => setAbandonOpen(true)}
              className="border border-muted/25 px-3 py-2 font-display text-[0.58rem] font-bold tracking-[0.18em] text-muted uppercase transition-colors hover:border-alert/50 hover:text-alert"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pb-3 sm:px-6">
          <div className="flex items-center justify-between text-[0.54rem] font-bold tracking-[0.18em] text-muted">
            <span>
              FASE {String(phase.number).padStart(2, "0")} /{" "}
              {String(phase.total).padStart(2, "0")}
            </span>
            <span className="flex items-center gap-4">
              <span className="sm:hidden">
                {run.lives} {run.lives === 1 ? "VIDA" : "VIDAS"}
              </span>
              <span>{run.correctCount} ACERTOS</span>
              {run.streak >= 2 ? (
                <span className="flex items-center gap-1 text-neon">
                  <FlameIcon className="size-3.5" /> x{run.streak}
                </span>
              ) : null}
            </span>
          </div>
          <div
            className="mt-2 h-1.5 bg-graphite"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={phase.total}
            aria-valuenow={phase.number - 1}
            aria-label="Progresso da partida"
          >
            <div
              className="h-full bg-neon shadow-[0_0_16px_rgba(57,255,20,0.55)] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
        <div className="pointer-events-none absolute top-1/3 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-neon/5 blur-[110px]" />
        <div className="relative w-full max-w-4xl">
          <div key={phase.id} className="animate-phase-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-[0.62rem] font-bold tracking-[0.32em] text-neon">
                {phase.eyebrow}
              </p>
              <div className="flex items-center gap-2 text-[0.55rem] font-bold tracking-[0.18em] text-muted">
                <span className="size-1.5 animate-pulse rounded-full bg-neon" />
                {submitting ? "VALIDANDO RESPOSTA" : "AGUARDANDO INTERAÇÃO"}
              </div>
            </div>

            <h1
              ref={promptRef}
              tabIndex={-1}
              className="mt-4 max-w-3xl text-2xl leading-tight text-ink outline-none sm:text-3xl md:text-4xl"
            >
              {phase.prompt}
            </h1>

            {phase.note ? (
              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted sm:text-sm">
                {phase.note}
              </p>
            ) : null}

            <div className="mt-8 sm:mt-10">
              <PhaseInteraction
                key={phase.id}
                phase={phase}
                disabled={submitting || result !== null}
                onAnswer={(payload) => void answer(payload)}
              />
            </div>
          </div>

          {error ? (
            <div className="mt-6">
              <ErrorNotice message={error} onRetry={() => setError(null)} retryLabel="Fechar aviso" />
            </div>
          ) : null}

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-neon/10 pt-4 text-[0.56rem] font-bold tracking-[0.16em] text-muted">
            <span>
              JOGADOR: <span className="text-ink">{player?.nickname ?? "—"}</span>
            </span>
            <span className="flex items-center gap-4">
              <span>
                SEQUÊNCIA: <span className="text-neon">{run.streak}</span>
              </span>
              <span>
                MELHOR: <span className="text-ink">{run.bestStreak}</span>
              </span>
            </span>
          </footer>
        </div>
      </main>

      {result ? <FeedbackOverlay result={result} onContinue={continueGame} /> : null}

      <Modal
        open={abandonOpen}
        title="Sair da partida?"
        onClose={() => {
          if (abandoning) return;
          setAbandonOpen(false);
          setAbandonError(null);
        }}
        footer={
          <>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setAbandonOpen(false)}
              disabled={abandoning}
            >
              Continuar jogando
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => void abandon()}
              disabled={abandoning}
            >
              {abandoning ? "Saindo..." : "Abandonar partida"}
            </button>
          </>
        }
      >
        <p>
          O progresso desta partida será encerrado sem entrar no ranking. Você pode
          começar outra quando quiser.
        </p>
        {abandonError ? (
          <p role="alert" className="mt-3 text-xs text-alert">
            {abandonError}
          </p>
        ) : null}
      </Modal>
    </div>
  );
}

function GameTopBar(): ReactNode {
  return (
    <div className="border-b border-neon/12 px-4 py-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Logo linked variant="mark" className="h-6 w-auto" />
        <span className="text-[0.58rem] font-bold tracking-[0.2em] text-muted">
          CONECTANDO...
        </span>
      </div>
    </div>
  );
}
