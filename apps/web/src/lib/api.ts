import type {
  ActiveRunResponse,
  AnswerResult,
  CreateRunResponse,
  GuestAuthResponse,
  LeaderboardEntry,
  PhaseAnswer,
  PlayerProfile,
  PlayerStats,
  RunDetails,
  RunState,
} from "@error/shared";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiClientError(
      0,
      "NETWORK_ERROR",
      "Sem conexão com o sistema. Verifique sua internet.",
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | { error?: { code?: string; message?: string; details?: unknown } }
    | null;

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      payload?.error?.code ?? "REQUEST_FAILED",
      payload?.error?.message ?? "Não foi possível concluir a operação.",
      payload?.error?.details,
    );
  }

  return payload as T;
}

export const api = {
  guest(deviceId: string, nickname: string): Promise<GuestAuthResponse> {
    return request<GuestAuthResponse>("/api/auth/guest", {
      method: "POST",
      body: { deviceId, nickname },
    });
  },

  me(token: string): Promise<{ player: PlayerProfile }> {
    return request<{ player: PlayerProfile }>("/api/me", { token });
  },

  updateNickname(
    token: string,
    nickname: string,
  ): Promise<{ player: PlayerProfile }> {
    return request<{ player: PlayerProfile }>("/api/me", {
      method: "PATCH",
      token,
      body: { nickname },
    });
  },

  stats(token: string): Promise<{ stats: PlayerStats }> {
    return request<{ stats: PlayerStats }>("/api/me/stats", { token });
  },

  startRun(token: string): Promise<CreateRunResponse> {
    return request<CreateRunResponse>("/api/runs", {
      method: "POST",
      token,
    });
  },

  activeRun(token: string): Promise<ActiveRunResponse> {
    return request<ActiveRunResponse>("/api/runs/active", { token });
  },

  run(token: string, runId: string): Promise<RunDetails> {
    return request<RunDetails>(`/api/runs/${runId}`, { token });
  },

  answer(
    token: string,
    runId: string,
    input: {
      phaseId: string;
      phaseIndex: number;
      answer: PhaseAnswer;
      durationMs: number;
    },
  ): Promise<AnswerResult> {
    return request<AnswerResult>(`/api/runs/${runId}/answers`, {
      method: "POST",
      token,
      body: input,
    });
  },

  abandon(token: string, runId: string): Promise<{ run: RunState }> {
    return request<{ run: RunState }>(`/api/runs/${runId}/abandon`, {
      method: "POST",
      token,
    });
  },

  leaderboard(limit = 20): Promise<{ entries: LeaderboardEntry[] }> {
    return request<{ entries: LeaderboardEntry[] }>(
      `/api/leaderboard?limit=${limit}`,
    );
  },
};
