import { useEffect, useState } from "react";
import { useOnlineStatus } from "../hooks/useAppHooks";
import { CloseIcon, DownloadIcon, PhoneIcon, WifiOffIcon } from "./icons";
import {
  dismissInstallBanner,
  isInstallBannerDismissed,
} from "../lib/storage";
import { useRegisterSW } from "virtual:pwa-register/react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 border border-alert/45 bg-[#170b0b]/95 px-4 py-3 text-alert shadow-[0_0_36px_rgba(255,48,48,0.18)] backdrop-blur sm:inset-x-auto sm:left-4 sm:max-w-sm"
    >
      <WifiOffIcon className="size-5 shrink-0" />
      <p className="text-xs leading-relaxed">
        <strong className="font-display tracking-[0.12em]">SEM CONEXÃO.</strong> O
        jogo precisa do servidor para validar as fases.
      </p>
    </div>
  );
}

export function InstallPrompt() {
  const online = useOnlineStatus();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInstallBannerDismissed()) return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (standalone) return;

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  if (!online || !visible || !promptEvent) return null;

  async function install() {
    if (!promptEvent) return;
    setInstalling(true);
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
        dismissInstallBanner();
      } else {
        setVisible(false);
      }
    } finally {
      setInstalling(false);
    }
  }

  function dismiss() {
    setVisible(false);
    dismissInstallBanner();
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="hud-panel p-4 pr-12">
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted transition-colors hover:text-ink"
          aria-label="Dispensar convite de instalação"
        >
          <CloseIcon className="size-4" />
        </button>
        <div className="flex items-start gap-3">
          <PhoneIcon className="mt-0.5 size-5 shrink-0 text-neon" />
          <div>
            <p className="font-display text-xs font-bold tracking-[0.18em] text-neon">
              INSTALE O ERROR
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              Abra como aplicativo, em tela cheia, e leve o teste com você.
            </p>
            <button
              type="button"
              onClick={() => void install()}
              disabled={installing}
              className="mt-3 inline-flex items-center gap-2 font-display text-[0.66rem] font-bold tracking-[0.16em] text-ink uppercase transition-colors hover:text-neon disabled:opacity-50"
            >
              <DownloadIcon className="size-4" />
              {installing ? "Abrindo..." : "Instalar agora"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      window.setInterval(() => {
        void registration.update();
      }, 60 * 60 * 1000);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-md">
      <div className="hud-panel flex items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs font-bold tracking-[0.16em] text-neon">
            NOVA VERSÃO DISPONÍVEL
          </p>
          <p className="mt-1 text-xs text-muted">
            Atualize para carregar a versão mais recente do sistema.
          </p>
        </div>
        <button
          type="button"
          className="btn-neon !min-h-9 shrink-0 !px-3 text-[0.62rem]"
          onClick={() => void updateServiceWorker(true)}
        >
          Atualizar
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          className="text-muted transition-colors hover:text-ink"
          aria-label="Dispensar atualização"
        >
          <CloseIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
