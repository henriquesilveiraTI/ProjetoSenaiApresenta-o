import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  linked?: boolean;
  label?: string;
  variant?: "full" | "mark";
}

export function Logo({
  className = "h-9 w-auto",
  linked = false,
  label,
  variant = "full",
}: LogoProps) {
  const image = (
    <img
      src={variant === "mark" ? "/logo-mark.png" : "/logo-error.png"}
      alt={label ?? "ERROR"}
      className={`select-none drop-shadow-[0_0_22px_rgba(57,255,20,0.2)] ${className}`}
      draggable={false}
      fetchPriority={linked ? "high" : "auto"}
    />
  );

  if (linked) {
    return (
      <Link
        to="/"
        aria-label="ERROR — página inicial"
        className="inline-flex items-center transition-opacity hover:opacity-85"
      >
        {image}
      </Link>
    );
  }

  return image;
}
