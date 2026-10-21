import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type {
  ChoicePhase,
  ChoiceSize,
  DragPhase,
  HoldPhase,
  MultiPhase,
  OutsidePhase,
  PhaseAnswer,
  PhaseChoice,
  PublicPhase,
  SequencePhase,
  SurfaceTone,
  TextTone,
  TypePhase,
  WaitPhase,
} from "@error/shared";
import { ArrowRightIcon, CheckIcon, RotateIcon, TargetIcon } from "../../components/icons";

interface PhaseViewProps {
  disabled: boolean;
  onAnswer: (answer: PhaseAnswer) => void;
}

const surfaceClasses: Record<SurfaceTone, string> = {
  panel: "border-muted/25 bg-graphite/55 text-ink",
  danger: "border-alert bg-alert/90 text-void hover:!bg-alert",
  neon: "border-neon bg-neon/90 text-void hover:!bg-neon",
  ghost: "border-dashed border-muted/30 bg-transparent text-ink",
};

const textToneClasses: Record<TextTone, string> = {
  ink: "text-ink",
  void: "text-void",
  neon: "text-neon",
  danger: "text-alert",
  muted: "text-muted",
  amber: "text-amber-300",
  sky: "text-sky-300",
  violet: "text-fuchsia-300",
};

const sizeClasses: Record<ChoiceSize, string> = {
  sm: "!min-h-11 !py-2.5 !text-sm",
  md: "!min-h-14 !text-base",
  lg: "!min-h-20 !text-lg sm:!text-xl",
};

function choiceClass(choice: PhaseChoice): string {
  return [
    "choice-base",
    surfaceClasses[choice.surface ?? "panel"],
    textToneClasses[choice.labelTone ?? "ink"],
    sizeClasses[choice.size ?? "md"],
  ].join(" ");
}

function ChoiceButton({
  choice,
  onClick,
  disabled,
  selected,
  badge,
}: {
  choice: PhaseChoice;
  onClick: () => void;
  disabled: boolean;
  selected?: boolean;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        choiceClass(choice),
        selected ? "!border-neon !bg-neon/12 shadow-[0_0_28px_rgba(57,255,20,0.15)]" : "",
      ].join(" ")}
    >
      {badge !== undefined ? (
        <span className="absolute top-1.5 left-2 font-mono text-[0.6rem] font-bold text-neon">
          {String(badge).padStart(2, "0")}
        </span>
      ) : null}
      <span>{choice.label}</span>
    </button>
  );
}

function ChoiceView({ phase, disabled, onAnswer }: PhaseViewProps & { phase: ChoicePhase }) {
  const columns =
    phase.columns === 1
      ? "grid-cols-1"
      : phase.columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className={`grid gap-3 ${columns}`}>
      {phase.choices.map((choice) => (
        <ChoiceButton
          key={choice.id}
          choice={choice}
          disabled={disabled}
          onClick={() => onAnswer({ kind: "choice", choiceId: choice.id })}
        />
      ))}
    </div>
  );
}

function OutsideView({ phase, disabled, onAnswer }: PhaseViewProps & { phase: OutsidePhase }) {
  useEffect(() => {
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !disabled) {
        onAnswer({ kind: "outside", target: "background" });
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [disabled, onAnswer]);

  return (
    <div
      className="relative flex min-h-72 flex-col items-center justify-center gap-6 border border-dashed border-muted/20 bg-void/30 p-5 sm:min-h-80"
      onClick={(event) => {
        if (event.target === event.currentTarget && !disabled) {
          onAnswer({ kind: "outside", target: "background" });
        }
      }}
      aria-label="Área externa do painel. Clique aqui fora dos botões, ou pressione Escape, para confirmar."
    >
      <div className="hud-panel relative w-full max-w-md p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="font-display text-[0.6rem] font-bold tracking-[0.22em] text-neon">
            {phase.panelTitle}
          </p>
          <span className="flex items-center gap-1.5 text-[0.55rem] tracking-[0.16em] text-muted">
            <span className="size-1.5 animate-pulse rounded-full bg-alert" />
            ATIVO
          </span>
        </div>
        <div className="grid gap-2.5">
          {phase.decoys.map((decoy) => (
            <button
              key={decoy.id}
              type="button"
              className={choiceClass({ ...decoy, size: decoy.size ?? "sm" })}
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                onAnswer({ kind: "outside", target: "panel" });
              }}
            >
              {decoy.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-center font-mono text-[0.65rem] leading-relaxed text-muted">
        A área fora deste painel também é interativa.
        <br />
        No teclado, use <kbd className="border border-muted/35 px-1 text-ink">Esc</kbd>.
      </p>
    </div>
  );
}

function WaitView({ phase, disabled, onAnswer }: PhaseViewProps & { phase: WaitPhase }) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const startRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    startRef.current = performance.now();

    const tick = (now: number) => {
      const value = Math.min((now - startRef.current) / phase.waitMs, 1);
      setProgress(value);
      if (value >= 1) {
        setReady(true);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [phase.waitMs]);

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="border border-neon/20 bg-void/55 p-5">
        <div className="flex items-center justify-between gap-3 text-[0.62rem] font-bold tracking-[0.18em]">
          <span className={ready ? "text-neon" : "text-muted"}>
            {ready ? "BARRA COMPLETA" : "CARREGANDO PROTOCOLO"}
          </span>
          <span className="font-mono text-muted">{Math.round(progress * 100)}%</span>
        </div>
        <div
          className="mt-3 h-3 overflow-hidden border border-neon/25 bg-graphite"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Progresso da barra"
        >
          <div
            className={`h-full ${ready ? "bg-neon" : "bg-neon/55"} transition-[width] duration-75`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!ready || disabled) return;
          onAnswer({
            kind: "wait",
            waitedMs: Math.round(performance.now() - startRef.current),
          });
        }}
        disabled={!ready || disabled}
        className={`mt-5 w-full ${ready ? "btn-neon" : "btn-ghost"}`}
      >
        {ready ? (
          <>
            <CheckIcon className="size-4" />
            {phase.readyLabel}
          </>
        ) : (
          phase.waitingLabel
        )}
      </button>
    </div>
  );
}

function SequenceView({
  phase,
  disabled,
  onAnswer,
}: PhaseViewProps & { phase: SequencePhase }) {
  const [order, setOrder] = useState<string[]>([]);

  function toggle(id: string) {
    setOrder((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {phase.items.map((item) => (
          <ChoiceButton
            key={item.id}
            choice={item}
            disabled={disabled}
            selected={order.includes(item.id)}
            badge={order.includes(item.id) ? order.indexOf(item.id) + 1 : undefined}
            onClick={() => toggle(item.id)}
          />
        ))}
      </div>

      <div className="mt-5 border border-neon/15 bg-void/45 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.6rem] font-bold tracking-[0.2em] text-muted">
            {phase.selectedLabel}
          </p>
          {order.length > 0 ? (
            <button
              type="button"
              onClick={() => setOrder([])}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.16em] text-muted uppercase transition-colors hover:text-alert"
            >
              <RotateIcon className="size-3.5" /> limpar
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex min-h-8 flex-wrap items-center gap-2">
          {order.length === 0 ? (
            <span className="text-xs text-muted/70">Nenhum item selecionado.</span>
          ) : (
            order.map((id, index) => {
              const item = phase.items.find((candidate) => candidate.id === id);
              return (
                <span
                  key={id}
                  className="border border-neon/40 bg-neon/8 px-2.5 py-1 font-display text-xs text-neon"
                >
                  {index + 1}. {item?.label ?? id}
                </span>
              );
            })
          )}
        </div>
      </div>

      <button
        type="button"
        className="btn-neon mt-4 w-full"
        disabled={disabled || order.length !== phase.items.length}
        onClick={() => onAnswer({ kind: "sequence", order })}
      >
        <ArrowRightIcon className="size-4" />
        {phase.submitLabel}
      </button>
    </div>
  );
}

function TypeView({ phase, disabled, onAnswer }: PhaseViewProps & { phase: TypePhase }) {
  const [value, setValue] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled || value.trim().length === 0) return;
    onAnswer({ kind: "type", value: value.trim() });
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-lg">
      <label htmlFor="resposta" className="sr-only">
        Resposta
      </label>
      <input
        id="resposta"
        name="resposta"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={phase.maxLength}
        placeholder={phase.placeholder}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={disabled}
        className="field text-center !text-lg"
      />
      {phase.helper ? (
        <p className="mt-2 text-center text-[0.65rem] text-muted">{phase.helper}</p>
      ) : null}
      <button
        type="submit"
        className="btn-neon mt-4 w-full"
        disabled={disabled || value.trim().length === 0}
      >
        <ArrowRightIcon className="size-4" />
        {phase.submitLabel}
      </button>
    </form>
  );
}

function DragView({ phase, disabled, onAnswer }: PhaseViewProps & { phase: DragPhase }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<"trash" | "keep" | null>(null);

  const submit = useCallback(
    (itemId: string, target: "trash" | "keep") => {
      if (disabled || !itemId) return;
      onAnswer({ kind: "drag", itemId, target });
    },
    [disabled, onAnswer],
  );

  function chooseTarget(target: "trash" | "keep") {
    if (!selected) return;
    submit(selected, target);
  }

  const zones: Array<{ id: "trash" | "keep"; label: string; hint: string }> = [
    { id: "trash", label: phase.targetLabel, hint: "descartar" },
    { id: "keep", label: phase.keepLabel, hint: "guardar" },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {phase.items.map((item) => (
          <button
            key={item.id}
            type="button"
            draggable={!disabled}
            onDragStart={(event) => {
              setDragging(item.id);
              setSelected(item.id);
              event.dataTransfer.setData("text/plain", item.id);
              event.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => {
              setDragging(null);
              setOver(null);
            }}
            onClick={() => setSelected(item.id)}
            disabled={disabled}
            aria-pressed={selected === item.id}
            className={[
              choiceClass(item),
              selected === item.id
                ? "!border-neon !bg-neon/12 shadow-[0_0_24px_rgba(57,255,20,0.13)]"
                : "",
              dragging === item.id ? "opacity-55" : "",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => chooseTarget(zone.id)}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setOver(zone.id);
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(event) => {
              event.preventDefault();
              const itemId = event.dataTransfer.getData("text/plain");
              setOver(null);
              if (itemId) submit(itemId, zone.id);
            }}
            disabled={disabled}
            className={[
              "flex min-h-28 flex-col items-center justify-center gap-1 border border-dashed p-4 transition-colors",
              zone.id === "trash"
                ? "border-alert/35 text-alert hover:bg-alert/6"
                : "border-neon/30 text-neon hover:bg-neon/6",
              over === zone.id ? "bg-neon/8" : "",
              !selected ? "opacity-60" : "",
            ].join(" ")}
          >
            <TargetIcon className="size-5" />
            <span className="font-display text-sm font-bold tracking-[0.12em]">
              {zone.label}
            </span>
            <span className="text-[0.58rem] tracking-[0.16em] text-muted uppercase">
              {zone.hint}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-[0.65rem] leading-relaxed text-muted">
        {selected
          ? "Agora escolha um destino — ou arraste a palavra até ele."
          : phase.selectHint}
      </p>
    </div>
  );
}

function HoldView({ phase, disabled, onAnswer }: PhaseViewProps & { phase: HoldPhase }) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const startRef = useRef(0);
  const frameRef = useRef(0);
  const submittedRef = useRef(false);

  const stopFrame = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
  }, []);

  const cancel = useCallback(() => {
    if (submittedRef.current) return;
    stopFrame();
    setHolding(false);
    setProgress(0);
  }, [stopFrame]);

  const begin = useCallback(() => {
    if (disabled || submittedRef.current || holding) return;

    setHolding(true);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const value = Math.min(elapsed / phase.holdMs, 1);
      setProgress(value);

      if (value >= 1) {
        submittedRef.current = true;
        setHolding(false);
        setProgress(1);
        onAnswer({ kind: "hold", heldMs: Math.round(elapsed) });
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [disabled, holding, onAnswer, phase.holdMs]);

  useEffect(() => () => stopFrame(), [stopFrame]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    begin();
  }

  function handleKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    cancel();
  }

  return (
    <div className="mx-auto w-full max-w-lg text-center">
      <div
        className="mx-auto h-3 w-full overflow-hidden border border-neon/25 bg-graphite"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label="Tempo segurando o botão"
      >
        <div
          className="h-full bg-neon transition-[width] duration-75"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <button
        type="button"
        onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
          if (event.button !== 0 && event.pointerType === "mouse") return;
          begin();
        }}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onContextMenu={(event) => event.preventDefault()}
        disabled={disabled}
        className={`mt-6 w-full touch-none select-none ${holding ? "btn-neon" : "btn-ghost"}`}
      >
        <span className={holding ? "animate-pulse" : ""}>
          {holding ? phase.holdingLabel : phase.buttonLabel}
        </span>
      </button>

      <p className="mt-4 text-[0.65rem] leading-relaxed text-muted">
        {holding
          ? `MANTENHA... ${Math.round(progress * 100)}%`
          : "Pressione e mantenha. Soltar antes da hora reinicia o contador."}
      </p>
    </div>
  );
}

function MultiView({ phase, disabled, onAnswer }: PhaseViewProps & { phase: MultiPhase }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {phase.items.map((item) => (
          <ChoiceButton
            key={item.id}
            choice={item}
            disabled={disabled}
            selected={selected.includes(item.id)}
            onClick={() => toggle(item.id)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-neon/15 bg-void/45 px-4 py-3">
        <p className="text-[0.62rem] font-bold tracking-[0.18em] text-muted">
          {phase.selectedLabel}:{" "}
          <span className={selected.length > 0 ? "text-neon" : "text-muted/60"}>
            {selected.length}
          </span>
        </p>
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={() => setSelected([])}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.16em] text-muted uppercase transition-colors hover:text-alert"
          >
            <RotateIcon className="size-3.5" /> limpar
          </button>
        ) : null}
      </div>

      <button
        type="button"
        className="btn-neon mt-4 w-full"
        disabled={disabled}
        onClick={() => onAnswer({ kind: "multi", selected })}
      >
        <ArrowRightIcon className="size-4" />
        {phase.submitLabel}
      </button>
    </div>
  );
}

export function PhaseInteraction({
  phase,
  disabled,
  onAnswer,
}: {
  phase: PublicPhase;
  disabled: boolean;
  onAnswer: (answer: PhaseAnswer) => void;
}) {
  switch (phase.kind) {
    case "choice":
      return <ChoiceView phase={phase} disabled={disabled} onAnswer={onAnswer} />;
    case "outside":
      return <OutsideView phase={phase} disabled={disabled} onAnswer={onAnswer} />;
    case "wait":
      return <WaitView phase={phase} disabled={disabled} onAnswer={onAnswer} />;
    case "sequence":
      return <SequenceView phase={phase} disabled={disabled} onAnswer={onAnswer} />;
    case "type":
      return <TypeView phase={phase} disabled={disabled} onAnswer={onAnswer} />;
    case "drag":
      return <DragView phase={phase} disabled={disabled} onAnswer={onAnswer} />;
    case "hold":
      return <HoldView phase={phase} disabled={disabled} onAnswer={onAnswer} />;
    case "multi":
      return <MultiView phase={phase} disabled={disabled} onAnswer={onAnswer} />;
  }
}
