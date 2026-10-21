import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { Logo } from "./Logo";
import {
  BookIcon,
  CloseIcon,
  MenuIcon,
  TrophyIcon,
  UserIcon,
  PlayIcon,
} from "./icons";

const navItems = [
  { to: "/", label: "Início", icon: PlayIcon, end: true },
  { to: "/ranking", label: "Ranking", icon: TrophyIcon, end: false },
  { to: "/como-jogar", label: "Como jogar", icon: BookIcon, end: false },
];

function navClass({ isActive }: { isActive: boolean }): string {
  return [
    "flex items-center gap-2 px-3 py-2 font-display text-[0.68rem] font-bold tracking-[0.18em] uppercase transition-colors",
    isActive
      ? "text-neon [text-shadow:0_0_18px_rgba(57,255,20,0.3)]"
      : "text-muted hover:text-ink",
  ].join(" ");
}

export function Header() {
  const { player } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-neon/12 bg-void/78 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo linked variant="mark" className="h-7 w-auto" />
          <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                <item.icon className="size-3.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {player ? (
            <Link
              to="/perfil"
              className="flex items-center gap-2.5 border border-neon/20 bg-graphite/60 px-2.5 py-1.5 transition-colors hover:border-neon/55"
            >
              <span className="flex size-7 items-center justify-center bg-neon/15 font-display text-xs font-bold text-neon">
                {player.nickname.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-28 truncate text-xs text-ink sm:block">
                {player.nickname}
              </span>
              <UserIcon className="size-3.5 text-muted sm:hidden" />
            </Link>
          ) : (
            <Link to="/#iniciar" className="btn-ghost !min-h-9 !px-3 !py-1 text-[0.66rem]">
              Entrar
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-10 items-center justify-center border border-muted/25 text-muted transition-colors hover:border-neon/50 hover:text-neon md:hidden"
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="menu-mobile"
          aria-label="Navegação móvel"
          className="border-t border-neon/10 bg-void/96 px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {[...navItems, { to: "/perfil", label: "Perfil", icon: UserIcon, end: false }].map(
              (item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 border-l-2 px-4 py-3 font-display text-xs font-bold tracking-[0.18em] uppercase",
                      isActive
                        ? "border-neon bg-neon/5 text-neon"
                        : "border-transparent text-muted",
                    ].join(" ")
                  }
                >
                  <item.icon className="size-4" />
                  {item.label}
                </NavLink>
              ),
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neon/10 bg-void/60">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo variant="mark" className="h-6 w-auto" />
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted">
            Um teste de atenção disfarçado de jogo. O sistema não quer saber o que
            você sabe — quer saber se você lê.
          </p>
        </div>
        <div>
          <p className="font-display text-[0.62rem] font-bold tracking-[0.24em] text-neon">
            NAVEGAR
          </p>
          <div className="mt-3 flex flex-col gap-2 text-xs text-muted">
            <Link to="/jogar" className="transition-colors hover:text-neon">
              Jogar
            </Link>
            <Link to="/ranking" className="transition-colors hover:text-neon">
              Ranking
            </Link>
            <Link to="/como-jogar" className="transition-colors hover:text-neon">
              Como jogar
            </Link>
            <Link to="/perfil" className="transition-colors hover:text-neon">
              Perfil
            </Link>
          </div>
        </div>
        <div>
          <p className="font-display text-[0.62rem] font-bold tracking-[0.24em] text-neon">
            SISTEMA
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Instalável como PWA.
            <br />
            Dados anônimos por dispositivo.
            <br />
            Nenhuma senha necessária.
          </p>
          <p className="mt-4 font-display text-[0.58rem] tracking-[0.16em] text-muted/60">
            © {new Date().getFullYear()} ERROR · MIT
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
