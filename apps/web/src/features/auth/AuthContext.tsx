import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { GuestAuthResponse, PlayerProfile } from "@error/shared";
import { api, ApiClientError } from "../../lib/api";
import {
  clearDeviceIdentity,
  clearSession,
  getOrCreateDeviceId,
  getStoredPlayer,
  getToken,
  setStoredPlayer,
  setToken,
} from "../../lib/storage";

interface AuthContextValue {
  player: PlayerProfile | null;
  token: string | null;
  ready: boolean;
  signIn: (nickname: string) => Promise<GuestAuthResponse>;
  rename: (nickname: string) => Promise<PlayerProfile>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerProfile | null>(() =>
    getStoredPlayer(),
  );
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const storedToken = getToken();
      const storedPlayer = getStoredPlayer();

      if (!storedToken) {
        setReady(true);
        return;
      }

      try {
        const { player: freshPlayer } = await api.me(storedToken);
        if (cancelled) return;
        setPlayer(freshPlayer);
        setStoredPlayer(freshPlayer);
        setTokenState(storedToken);
      } catch (error) {
        if (cancelled) return;

        const isAuthError =
          error instanceof ApiClientError &&
          (error.status === 401 || error.status === 403);

        if (isAuthError && storedPlayer?.nickname) {
          try {
            const response = await api.guest(
              getOrCreateDeviceId(),
              storedPlayer.nickname,
            );
            if (cancelled) return;
            setToken(response.token);
            setStoredPlayer(response.player);
            setPlayer(response.player);
            setTokenState(response.token);
            setReady(true);
            return;
          } catch {
            // Cai no fluxo de limpeza abaixo.
          }
        }

        clearSession();
        setPlayer(null);
        setTokenState(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (nickname: string) => {
    const response = await api.guest(getOrCreateDeviceId(), nickname.trim());
    setToken(response.token);
    setStoredPlayer(response.player);
    setPlayer(response.player);
    setTokenState(response.token);
    return response;
  }, []);

  const rename = useCallback(
    async (nickname: string) => {
      if (!token) {
        throw new ApiClientError(401, "UNAUTHORIZED", "Entre para continuar.");
      }
      const { player: updated } = await api.updateNickname(token, nickname.trim());
      setPlayer(updated);
      setStoredPlayer(updated);
      return updated;
    },
    [token],
  );

  const signOut = useCallback(() => {
    clearSession();
    clearDeviceIdentity();
    setPlayer(null);
    setTokenState(null);
  }, []);

  const value = useMemo(
    () => ({ player, token, ready, signIn, rename, signOut }),
    [player, token, ready, signIn, rename, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de AuthProvider.");
  }
  return context;
}
