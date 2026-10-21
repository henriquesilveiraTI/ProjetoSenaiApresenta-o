import type { PlayerProfile } from "@error/shared";

const KEYS = {
  token: "error.token",
  player: "error.player",
  device: "error.device",
  installDismissed: "error.install-dismissed",
} as const;

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Armazenamento indisponível (modo privado antigo). O app segue sem persistir.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignora.
  }
}

export function getToken(): string | null {
  return read(KEYS.token);
}

export function setToken(token: string): void {
  write(KEYS.token, token);
}

export function getStoredPlayer(): PlayerProfile | null {
  const raw = read(KEYS.player);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    if (
      typeof parsed.id === "string" &&
      typeof parsed.nickname === "string" &&
      typeof parsed.createdAt === "string"
    ) {
      return parsed as PlayerProfile;
    }
  } catch {
    // Formato antigo ou inválido.
  }

  return null;
}

export function setStoredPlayer(player: PlayerProfile): void {
  write(KEYS.player, JSON.stringify(player));
}

export function clearSession(): void {
  remove(KEYS.token);
  remove(KEYS.player);
}

export function clearDeviceIdentity(): void {
  remove(KEYS.device);
}

export function getOrCreateDeviceId(): string {
  const existing = read(KEYS.device);
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-${Math.random().toString(36).slice(2, 12)}`;

  write(KEYS.device, id);
  return id;
}

export function isInstallBannerDismissed(): boolean {
  return read(KEYS.installDismissed) === "1";
}

export function dismissInstallBanner(): void {
  write(KEYS.installDismissed, "1");
}
