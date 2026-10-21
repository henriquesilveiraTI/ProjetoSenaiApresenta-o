import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useAppHooks";
import { ArrowLeftIcon, PlayIcon } from "../components/icons";

export function NotFoundPage() {
  useDocumentTitle("Rota inexistente");

  return (
    <section className="mx-auto flex min-h-[65vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="animate-flicker font-display text-7xl font-bold text-neon text-glow sm:text-9xl">
        404
      </p>
      <p className="mt-3 font-display text-[0.62rem] font-bold tracking-[0.32em] text-alert">
        ROTA NÃO ENCONTRADA
      </p>
      <h1 className="mt-6 text-3xl text-ink sm:text-4xl">
        O sistema não reconhece este endereço.
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
        Pode ser um erro de digitação, um link antigo ou mais uma tentativa do
        sistema de testar se você confia no que está escrito. De qualquer forma,
        não há fase aqui.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/" className="btn-neon">
          <ArrowLeftIcon className="size-4" /> Voltar ao início
        </Link>
        <Link to="/jogar" className="btn-ghost">
          <PlayIcon className="size-4" /> Ir para o jogo
        </Link>
      </div>
    </section>
  );
}
