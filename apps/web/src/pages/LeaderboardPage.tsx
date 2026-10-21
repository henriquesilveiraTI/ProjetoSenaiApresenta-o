import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { LeaderboardEntry } from "@error/shared";
import { useAuth } from "../features/auth/AuthContext";
import { api, ApiClientError } from "../lib/api";
import {
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  pluralize,
} from "../lib/format";
import { useDocumentTitle } from "../hooks/useAppHooks";
import {
  EmptyState,
  ErrorNotice,
  LoadingScreen,
  SectionHeading,
  StatusBadge,
} from "../components/ui";
import {
  ArrowRightIcon,
  ClockIcon,
  FlameIcon,
  PlayIcon,
  TargetIcon,
  TrophyIcon,
} from "../components/icons";

const podiumStyles = [
  {
    wrapper: "border-neon/45 bg-neon/[0.055]",
    rank: "text-neon text-4xl",
    badge: "border-neon/50 text-neon",
  },
  {
    wrapper: "border-ink/20 bg-ink/[0.025]",
    rank: "text-ink text-3xl",
    badge: "border-ink/30 text-ink",
  },
  {
    wrapper: "border-amber-500/25 bg-amber-500/[0.03]",
    rank: "text-amber-300 text-3xl",
    badge: "border-amber-500/35 text-amber-300",
  },
];

export function LeaderboardPage() {
  useDocumentTitle("Ranking");
  const { player } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .leaderboard(25)
      .then((response) => {
        if (!cancelled) setEntries(response.entries);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(
            requestError instanceof ApiClientError
              ? requestError.message
              : "Não foi possível carregar o ranking.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (loading) {
    return <LoadingScreen label="CONSULTANDO RANKING GLOBAL" />;
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
        <ErrorNotice
          message={error}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      </section>
    );
  }

  const top = entries.slice(0, 3);
  const rest = entries.slice(3);
  const playerEntry = entries.find((entry) => entry.playerId === player?.id);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="RANKING GLOBAL"
        title="OS QUE DESCONFIARAM DO ÓBVIO."
        description="O melhor resultado de cada jogador. Pontuação primeiro; empate resolve por fases superadas e tempo."
        action={
          <Link to={player ? "/jogar" : "/#iniciar"} className="btn-neon">
            <PlayIcon className="size-4" /> {player ? "Jogar agora" : "Entrar e jogar"}
          </Link>
        }
      />

      {playerEntry ? (
        <div className="mt-8 flex flex-col gap-3 border border-neon/20 bg-neon/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            Sua melhor posição:{" "}
            <span className="font-display text-neon">#{playerEntry.rank}</span>{" "}
            <span className="text-muted/60">·</span>{" "}
            {formatNumber(playerEntry.score)} pontos
          </p>
          <Link
            to="/perfil"
            className="inline-flex items-center gap-2 text-[0.62rem] font-bold tracking-[0.16em] text-neon uppercase"
          >
            Ver meu perfil <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      ) : null}

      {entries.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Ninguém sobreviveu ainda."
            description="O ranking está vazio. A primeira pontuação registrada pode ser a sua — e ninguém vai saber se foi sorte."
            action={
              <Link to={player ? "/jogar" : "/#iniciar"} className="btn-neon">
                <PlayIcon className="size-4" /> Ser o primeiro
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {top.map((entry, index) => {
              const style = podiumStyles[index] ?? podiumStyles[1];
              const isCurrent = entry.playerId === player?.id;

              return (
                <article
                  key={entry.playerId}
                  className={[
                    "hud-panel relative p-5",
                    style?.wrapper ?? "",
                    index === 0 ? "md:-translate-y-2" : "",
                    isCurrent ? "ring-1 ring-neon/30" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-display font-bold ${style?.rank ?? ""}`}>
                        #{entry.rank}
                      </p>
                      <p className="mt-2 max-w-44 truncate font-display text-lg text-ink">
                        {entry.nickname}
                      </p>
                      {isCurrent ? (
                        <span className="mt-1 inline-block text-[0.55rem] font-bold tracking-[0.18em] text-neon">
                          VOCÊ
                        </span>
                      ) : null}
                    </div>
                    {entry.rank === 1 ? (
                      <TrophyIcon className="size-7 text-neon" />
                    ) : (
                      <span
                        className={`border px-2 py-1 font-display text-[0.58rem] tracking-[0.14em] ${
                          style?.badge ?? ""
                        }`}
                      >
                        TOP {entry.rank}
                      </span>
                    )}
                  </div>

                  <p className="mt-6 font-display text-4xl text-neon">
                    {formatNumber(entry.score)}
                    <span className="ml-1 text-[0.58rem] tracking-[0.12em] text-muted">
                      PTS
                    </span>
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-neon/10 pt-3 text-[0.62rem] text-muted">
                    <span className="flex items-center gap-1.5">
                      <TargetIcon className="size-3.5 text-neon" />
                      {entry.cleared}/{entry.totalPhases} fases
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FlameIcon className="size-3.5 text-neon" />
                      sequência {entry.bestStreak}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ClockIcon className="size-3.5 text-neon" />
                      {formatDuration(entry.durationMs)}
                    </span>
                    <StatusBadge status={entry.status} />
                  </div>
                </article>
              );
            })}
          </div>

          {rest.length > 0 ? (
            <div className="mt-8 hud-panel overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-neon/10 px-4 py-3 sm:px-6">
                <p className="font-display text-[0.62rem] font-bold tracking-[0.22em] text-neon">
                  CLASSIFICAÇÃO COMPLETA
                </p>
                <span className="text-[0.55rem] tracking-[0.16em] text-muted">
                  {entries.length} {pluralize(entries.length, "JOGADOR", "JOGADORES")}
                </span>
              </div>

              <div className="hidden grid-cols-[3rem_1fr_6rem_6rem_5rem_5rem] gap-3 border-b border-neon/10 px-6 py-2 text-[0.55rem] font-bold tracking-[0.16em] text-muted uppercase md:grid">
                <span>#</span>
                <span>Jogador</span>
                <span className="text-right">Pontos</span>
                <span className="text-right">Fases</span>
                <span className="text-right">Precisão</span>
                <span className="text-right">Tempo</span>
              </div>

              <div className="divide-y divide-neon/8">
                {rest.map((entry) => {
                  const isCurrent = entry.playerId === player?.id;
                  const accuracy =
                    entry.correctCount + entry.wrongCount > 0
                      ? (entry.correctCount /
                          (entry.correctCount + entry.wrongCount)) *
                        100
                      : 0;

                  return (
                    <div
                      key={entry.playerId}
                      className={[
                        "grid gap-2 px-4 py-4 text-sm md:grid-cols-[3rem_1fr_6rem_6rem_5rem_5rem] md:items-center md:gap-3 md:px-6",
                        isCurrent ? "bg-neon/[0.045]" : "",
                      ].join(" ")}
                    >
                      <span className="font-display text-lg text-muted">
                        #{entry.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 truncate font-display text-sm text-ink">
                          {entry.nickname}
                          {isCurrent ? (
                            <span className="border border-neon/40 px-1.5 py-0.5 text-[0.5rem] font-bold tracking-[0.14em] text-neon">
                              VOCÊ
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-[0.58rem] text-muted md:hidden">
                          {entry.cleared}/{entry.totalPhases} fases ·{" "}
                          {formatPercent(accuracy)} de precisão ·{" "}
                          {formatDateTime(entry.finishedAt)}
                        </p>
                      </div>
                      <span className="font-display text-base text-neon md:text-right">
                        {formatNumber(entry.score)}
                      </span>
                      <span className="hidden text-right text-xs text-muted md:block">
                        {entry.cleared}/{entry.totalPhases}
                      </span>
                      <span className="hidden text-right text-xs text-muted md:block">
                        {formatPercent(accuracy)}
                      </span>
                      <span className="hidden text-right text-xs text-muted md:block">
                        {formatDuration(entry.durationMs)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      )}

      <p className="mt-8 max-w-3xl text-[0.62rem] leading-relaxed text-muted">
        Critério: maior pontuação; desempate por mais fases superadas, menor tempo
        e data de conclusão. Partidas abandonadas não entram. A sessão é vinculada
        a este dispositivo — sem senha, sem recuperação de conta.
      </p>
    </section>
  );
}
