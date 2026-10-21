import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { PlayerStats } from "@error/shared";
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
  ErrorNotice,
  LoadingScreen,
  Modal,
  SectionHeading,
  StatCard,
  StatusBadge,
} from "../components/ui";
import {
  ArrowRightIcon,
  ChartIcon,
  ClockIcon,
  CloseIcon,
  FlameIcon,
  PlayIcon,
  RotateIcon,
  TargetIcon,
  TrophyIcon,
  UserIcon,
} from "../components/icons";

export function ProfilePage() {
  useDocumentTitle("Perfil");
  const navigate = useNavigate();
  const { player, token, ready, rename, signOut } = useAuth();

  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState(player?.nickname ?? "");
  const [saving, setSaving] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [nicknameSaved, setNicknameSaved] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setNickname(player?.nickname ?? "");
  }, [player?.nickname]);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .stats(token)
      .then((response) => {
        if (!cancelled) setStats(response.stats);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(
            requestError instanceof ApiClientError
              ? requestError.message
              : "Não foi possível carregar suas estatísticas.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, token, reloadKey]);

  async function saveNickname(event: FormEvent) {
    event.preventDefault();
    const clean = nickname.trim();

    if (clean.length < 2 || clean.length > 20) {
      setNicknameError("O apelido precisa ter entre 2 e 20 caracteres.");
      return;
    }

    setSaving(true);
    setNicknameError(null);
    setNicknameSaved(false);

    try {
      await rename(clean);
      setNicknameSaved(true);
      window.setTimeout(() => setNicknameSaved(false), 2500);
    } catch (requestError) {
      setNicknameError(
        requestError instanceof ApiClientError
          ? requestError.message
          : "Não foi possível salvar o apelido.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return <LoadingScreen label="CARREGANDO PERFIL" />;
  }

  if (!token || !player) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
        <UserIcon className="size-10 text-neon" />
        <h1 className="mt-5 text-3xl text-ink">Nenhuma sessão ativa.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Entre com um apelido na página inicial para salvar partidas, recordes e
          posição no ranking. Não há senha — a sessão pertence a este dispositivo.
        </p>
        <Link to="/#iniciar" className="btn-neon mt-7">
          <PlayIcon className="size-4" /> Entrar e jogar
        </Link>
      </section>
    );
  }

  if (loading) {
    return <LoadingScreen label="CARREGANDO PERFIL" />;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="PERFIL DO JOGADOR"
        title={player.nickname}
        description="Sua identidade, seus números e o histórico recente. Tudo salvo neste dispositivo."
        action={
          <Link to="/jogar" className="btn-neon">
            <PlayIcon className="size-4" /> Jogar agora
          </Link>
        }
      />

      {error ? (
        <div className="mt-8">
          <ErrorNotice
            message={error}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hud-panel p-6">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center border border-neon/35 bg-neon/10 font-display text-2xl font-bold text-neon">
              {player.nickname.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-display text-xl text-ink">{player.nickname}</p>
              <p className="mt-1 text-[0.62rem] tracking-[0.14em] text-muted">
                PERFIL ANÔNIMO · DESDE {formatDateTime(player.createdAt)}
              </p>
            </div>
          </div>

          <form onSubmit={saveNickname} className="mt-6 border-t border-neon/10 pt-5">
            <label
              htmlFor="profile-nickname"
              className="text-[0.6rem] font-bold tracking-[0.2em] text-muted uppercase"
            >
              Alterar apelido
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="profile-nickname"
                value={nickname}
                onChange={(event) => {
                  setNickname(event.target.value);
                  setNicknameError(null);
                  setNicknameSaved(false);
                }}
                maxLength={20}
                minLength={2}
                autoComplete="nickname"
                spellCheck={false}
                className="field"
              />
              <button
                type="submit"
                disabled={saving || nickname.trim() === player.nickname}
                className="btn-ghost shrink-0"
              >
                {saving ? <RotateIcon className="size-4 animate-spin" /> : "Salvar"}
              </button>
            </div>
            {nicknameError ? (
              <p role="alert" className="mt-2 text-xs text-alert">
                {nicknameError}
              </p>
            ) : null}
            {nicknameSaved ? (
              <p role="status" className="mt-2 text-xs text-neon">
                Apelido atualizado no ranking.
              </p>
            ) : null}
          </form>

          <div className="mt-6 border-t border-neon/10 pt-5">
            <button
              type="button"
              onClick={() => setSignOutOpen(true)}
              className="text-[0.62rem] font-bold tracking-[0.16em] text-muted uppercase transition-colors hover:text-alert"
            >
              Sair deste dispositivo
            </button>
            <p className="mt-2 text-[0.6rem] leading-relaxed text-muted/70">
              A sessão é anônima. Ao sair, um novo jogador será criado na próxima
              entrada — o histórico atual não poderá ser recuperado.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Recorde"
            value={formatNumber(stats?.bestScore ?? 0)}
            detail={`${stats?.games ?? 0} ${pluralize(
              stats?.games ?? 0,
              "partida encerrada",
              "partidas encerradas",
            )}`}
            icon={<TrophyIcon className="size-5" />}
          />
          <StatCard
            label="Precisão"
            value={formatPercent(stats?.accuracy ?? 0)}
            detail={`${stats?.totalCorrect ?? 0} ${pluralize(
              stats?.totalCorrect ?? 0,
              "acerto",
              "acertos",
            )} em ${stats?.totalAnswers ?? 0} ${pluralize(
              stats?.totalAnswers ?? 0,
              "resposta",
              "respostas",
            )}`}
            icon={<TargetIcon className="size-5" />}
          />
          <StatCard
            label="Melhor sequência"
            value={stats?.bestStreak ?? 0}
            detail="acertos consecutivos"
            icon={<FlameIcon className="size-5" />}
          />
          <StatCard
            label="Tempo total"
            value={formatDuration(stats?.totalTimeMs ?? 0)}
            detail={`${stats?.completed ?? 0} ${pluralize(
              stats?.completed ?? 0,
              "concluída",
              "concluídas",
            )} · ${stats?.failed ?? 0} ${pluralize(
              stats?.failed ?? 0,
              "bloqueada",
              "bloqueadas",
            )}`}
            icon={<ClockIcon className="size-5" />}
            accent="muted"
          />
        </div>
      </div>

      <div className="mt-6 hud-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ChartIcon className="size-5 text-neon" />
            <p className="font-display text-xs font-bold tracking-[0.22em] text-neon">
              PARTIDAS RECENTES
            </p>
          </div>
          <Link
            to="/ranking"
            className="inline-flex items-center gap-2 text-[0.6rem] font-bold tracking-[0.16em] text-muted uppercase transition-colors hover:text-neon"
          >
            Ranking <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>

        {stats?.recentRuns.length ? (
          <div className="mt-5 divide-y divide-neon/8">
            {stats.recentRuns.map((run) => {
              const finished = run.status !== "active";
              return (
                <div
                  key={run.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center border border-neon/15 bg-void/50">
                      {run.correctCount >= run.totalPhases ? (
                        <TrophyIcon className="size-5 text-neon" />
                      ) : run.status === "failed" ? (
                        <CloseIcon className="size-5 text-alert" />
                      ) : (
                        <ClockIcon className="size-5 text-muted" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-sm text-ink">
                          {formatNumber(run.score)} pontos
                        </p>
                        <StatusBadge status={run.status} />
                      </div>
                      <p className="mt-1 text-[0.6rem] text-muted">
                        {run.cleared}/{run.totalPhases} fases ·{" "}
                        {run.bestStreak} de sequência ·{" "}
                        {formatDuration(run.durationMs)} ·{" "}
                        {formatDateTime(run.finishedAt ?? run.startedAt)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={finished ? `/resultado/${run.id}` : "/jogar"}
                    className="inline-flex items-center gap-2 self-start border border-muted/25 px-3 py-2 font-display text-[0.58rem] font-bold tracking-[0.16em] text-muted uppercase transition-colors hover:border-neon/50 hover:text-neon sm:self-auto"
                  >
                    {finished ? "Ver resultado" : "Continuar"}
                    <ArrowRightIcon className="size-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-sm text-muted">
              Nenhuma partida registrada. O sistema ainda não tem do que te acusar.
            </p>
            <Link to="/jogar" className="btn-neon mt-5">
              <PlayIcon className="size-4" /> Fazer o primeiro teste
            </Link>
          </div>
        )}
      </div>

      <Modal
        open={signOutOpen}
        title="Sair deste dispositivo?"
        onClose={() => setSignOutOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setSignOutOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                signOut();
                navigate("/", { replace: true });
              }}
            >
              Sair e criar novo perfil
            </button>
          </>
        }
      >
        O perfil atual e seu histórico continuam no ranking, mas este dispositivo
        não conseguirá acessá-los novamente. Na próxima entrada, um novo jogador
        será criado.
      </Modal>
    </section>
  );
}
