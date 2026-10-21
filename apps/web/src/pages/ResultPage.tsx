import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { RunDetails } from "@error/shared";
import { useAuth } from "../features/auth/AuthContext";
import { api, ApiClientError } from "../lib/api";
import {
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
} from "../lib/format";
import { useDocumentTitle } from "../hooks/useAppHooks";
import { ErrorNotice, LoadingScreen, StatusBadge } from "../components/ui";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  FlameIcon,
  LockIcon,
  PlayIcon,
  RotateIcon,
  ShareIcon,
  TargetIcon,
  TrophyIcon,
} from "../components/icons";

export function ResultPage() {
  useDocumentTitle("Resultado");
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const { token, player, ready } = useAuth();

  const [details, setDetails] = useState<RunDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!token || !runId) {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .run(token, runId)
      .then((response) => {
        if (cancelled) return;
        setDetails(response);
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;
        setError(
          requestError instanceof ApiClientError
            ? requestError.message
            : "Não foi possível carregar o resultado.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, token, runId, navigate]);

  async function playAgain() {
    if (!token) return;
    setStarting(true);
    setError(null);
    try {
      await api.startRun(token);
      navigate("/jogar");
    } catch (requestError) {
      setError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Não foi possível iniciar outra partida.",
      );
    } finally {
      setStarting(false);
    }
  }

  async function share() {
    if (!details) return;

    const text = `${player?.nickname ?? "Um jogador"} marcou ${formatNumber(details.run.score)} pontos e superou ${details.run.cleared}/${details.run.totalPhases} fases no ERROR. Desconfie do óbvio.`;
    const url = window.location.origin;

    try {
      if (navigator.share) {
        await navigator.share({ title: "ERROR — desconfie do óbvio", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareFeedback("Resultado copiado para a área de transferência.");
    } catch {
      setShareFeedback("Não foi possível compartilhar neste navegador.");
    }
  }

  if (loading) {
    return <LoadingScreen label="GERANDO DIAGNÓSTICO" />;
  }

  if (!details) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-5 px-4">
        <ErrorNotice message={error ?? "Resultado não encontrado."} />
        <Link to="/" className="btn-ghost">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const { run, answers } = details;
  const failed = run.status === "failed";
  const perfect = run.correctCount === run.totalPhases;
  const accuracy =
    run.correctCount + run.wrongCount > 0
      ? (run.correctCount / (run.correctCount + run.wrongCount)) * 100
      : 0;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          className={`hud-panel animate-feedback-in relative overflow-hidden p-6 sm:p-9 ${
            failed ? "border-alert/40" : ""
          }`}
        >
          <div
            className={`pointer-events-none absolute -top-24 -right-16 size-64 rounded-full blur-[90px] ${
              failed ? "bg-alert/12" : "bg-neon/12"
            }`}
          />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p
                className={`font-display text-[0.62rem] font-bold tracking-[0.32em] ${
                  failed ? "text-alert" : "text-neon"
                }`}
              >
                DIAGNÓSTICO FINAL
              </p>
              <StatusBadge status={run.status} />
            </div>

            <div
              className={`mt-6 flex size-16 items-center justify-center border ${
                failed
                  ? "border-alert/45 bg-alert/10 text-alert"
                  : "border-neon/45 bg-neon/10 text-neon"
              }`}
            >
              {failed ? <LockIcon className="size-8" /> : <TrophyIcon className="size-8" />}
            </div>

            <p className="mt-5 text-[0.6rem] font-bold tracking-[0.24em] text-muted">
              PONTUAÇÃO FINAL
            </p>
            <p
              className={`mt-1 font-display text-6xl font-bold sm:text-7xl ${
                failed ? "text-alert" : "text-neon text-glow"
              }`}
            >
              {formatNumber(run.score)}
            </p>

            <h1 className="mt-5 text-3xl text-ink sm:text-4xl">
              {failed
                ? "ACESSO BLOQUEADO."
                : perfect
                  ? "SEM ERROS."
                  : "VOCÊ SOBREVIVEU."}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              {failed
                ? "O sistema encontrou erros suficientes para encerrar o teste. A lógica de cada armadilha ficou registrada abaixo — leia antes de tentar novamente."
                : perfect
                  ? "Doze fases, nenhuma armadilha vencida. Você leu o que estava escrito, não o que esperava ler. Isso é raro."
                  : "Você chegou ao fim, mas o sistema ainda registrou erros de interpretação. O ranking existe para lembrar que quase não conta."}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void playAgain()}
                disabled={starting}
                className="btn-neon"
              >
                {starting ? <RotateIcon className="size-4 animate-spin" /> : <PlayIcon className="size-4" />}
                Jogar novamente
              </button>
              <Link to="/ranking" className="btn-ghost">
                <TrophyIcon className="size-4" /> Ver ranking
              </Link>
              <button type="button" onClick={() => void share()} className="btn-ghost">
                <ShareIcon className="size-4" /> Compartilhar
              </button>
            </div>

            {shareFeedback ? (
              <p className="mt-3 text-xs text-muted" role="status">
                {shareFeedback}
              </p>
            ) : null}

            {error ? (
              <div className="mt-5">
                <ErrorNotice message={error} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="grid grid-cols-2 gap-4">
            <ResultStat
              icon={<CheckIcon className="size-4" />}
              label="Fases superadas"
              value={`${run.correctCount}/${run.totalPhases}`}
              accent={failed ? "alert" : "neon"}
            />
            <ResultStat
              icon={<TargetIcon className="size-4" />}
              label="Precisão"
              value={formatPercent(accuracy)}
            />
            <ResultStat
              icon={<FlameIcon className="size-4" />}
              label="Melhor sequência"
              value={String(run.bestStreak)}
            />
            <ResultStat
              icon={<ClockIcon className="size-4" />}
              label="Tempo total"
              value={formatDuration(run.durationMs)}
            />
          </div>

          <div className="hud-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-[0.62rem] font-bold tracking-[0.22em] text-neon">
                HISTÓRICO DA PARTIDA
              </p>
              <span className="text-[0.55rem] tracking-[0.14em] text-muted">
                {run.wrongCount} {run.wrongCount === 1 ? "ERRO" : "ERROS"}
              </span>
            </div>

            <div className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
              {answers.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted">
                  Nenhuma resposta registrada.
                </p>
              ) : (
                answers.map((answer) => (
                  <div
                    key={`${answer.phaseIndex}-${answer.phaseId}`}
                    className={[
                      "flex items-center justify-between gap-3 border-l-2 px-3 py-2.5",
                      answer.correct
                        ? "border-neon/50 bg-neon/5"
                        : "border-alert/50 bg-alert/5",
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center ${
                          answer.correct ? "text-neon" : "text-alert"
                        }`}
                      >
                        {answer.correct ? (
                          <CheckIcon className="size-4" />
                        ) : (
                          <CloseIcon className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-display text-[0.7rem] text-ink">
                          {answer.phaseTitle}
                        </p>
                        <p className="mt-0.5 text-[0.58rem] text-muted">
                          {formatDuration(answer.durationMs)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 font-display text-sm ${
                        answer.correct ? "text-neon" : "text-muted"
                      }`}
                    >
                      {answer.correct ? `+${answer.points}` : "0"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <p className="mt-4 border-t border-neon/10 pt-3 text-[0.58rem] leading-relaxed text-muted">
              Encerrada em {formatDateTime(run.finishedAt ?? run.startedAt)}. O
              ranking considera apenas o melhor resultado de cada jogador.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-neon/10 pt-6">
        <Link
          to="/"
          className="text-[0.62rem] font-bold tracking-[0.18em] text-muted uppercase transition-colors hover:text-neon"
        >
          ← Voltar ao início
        </Link>
        <Link
          to="/como-jogar"
          className="inline-flex items-center gap-2 text-[0.62rem] font-bold tracking-[0.18em] text-muted uppercase transition-colors hover:text-neon"
        >
          Revisar as regras <ArrowRightIcon className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}

function ResultStat({
  icon,
  label,
  value,
  accent = "neon",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent?: "neon" | "alert";
}) {
  return (
    <div className="hud-panel p-4">
      <div className={`flex items-center gap-2 ${accent === "alert" ? "text-alert" : "text-neon"}`}>
        {icon}
        <span className="text-[0.55rem] font-bold tracking-[0.16em] text-muted uppercase">
          {label}
        </span>
      </div>
      <p className={`mt-3 font-display text-2xl ${accent === "alert" ? "text-alert" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
