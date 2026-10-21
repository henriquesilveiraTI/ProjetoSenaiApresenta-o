import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...props,
    className: props.className ?? "size-5",
  };
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4.5 20 12 7 19.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 4h8v4a4 4 0 0 1-8 0Z" />
      <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" />
      <path d="M12 12v4M9 20h6M10 16h4l1 4H9Z" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
      <path d="M4 5.5V21M8 7h8M8 11h5" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 12H4M10 6l-6 6 6 6" />
    </svg>
  );
}

export function RotateIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 8v5h-5" />
      <path d="M19.1 13A7.5 7.5 0 1 1 17 6.5L20 9" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v12M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function WifiOffIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 3l18 18" />
      <path d="M8.5 8.5a11 11 0 0 1 10.7 1.2M2.8 9.7a15 15 0 0 1 3.4-2.1M5.5 13.3a10 10 0 0 1 5.1-1.6M9.8 16.9a4.5 4.5 0 0 1 4.4 0" />
      <circle cx="12" cy="20" r=".7" fill="currentColor" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="10" width="14" height="11" rx="1.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.5 2" />
    </svg>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 3c1 4-3.5 5.5-3.5 9a3.5 3.5 0 0 0 7 0c0-1.6-.7-3-1.7-4.2.2 2.2-1 3.2-2.1 3.2 1.5-2.7.6-5.6.3-8Z" />
      <path d="M6.2 14.5A6.5 6.5 0 1 0 18 17.4" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2.5 13.7 9l6.3 1.7-6.3 1.7L12 19l-1.7-6.6L4 10.7 10.3 9 12 2.5Z" />
      <path d="M19 3v3M20.5 4.5h-3" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="2.5" width="12" height="19" rx="2" />
      <path d="M10 5h4M11 18.5h2" />
    </svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}
