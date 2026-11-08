import { useId } from "react";

const WAVE_ORANGE =
  "M26 50 C84 44 128 66 162 98 C196 128 238 140 282 124 C238 172 190 172 154 144 C122 118 90 76 26 50 Z";
const WAVE_BLUE =
  "M14 14 C70 0 132 8 172 54 C202 88 236 116 286 120 C240 140 196 126 162 96 C128 64 80 42 14 50 Z";

/**
 * Neckair-Logo (Bildmarke + Wortmarke).
 * `tone="light"` für dunkle Hintergründe, `tone="dark"` für helle.
 */
export function Logo({
  tone = "dark",
  className,
  markOnly = false,
}: {
  tone?: "light" | "dark";
  className?: string;
  markOnly?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const base = tone === "light" ? "#f7f4ee" : "#0b2239";
  const cut = tone === "light" ? "#0b2239" : "#ffffff";
  return (
    <svg
      viewBox={markOnly ? "0 0 300 178" : "0 0 1100 178"}
      className={className}
      role="img"
      aria-label="Neckair"
    >
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5cb6f2" />
          <stop offset="1" stopColor="#1e88e5" />
        </linearGradient>
        <linearGradient id={`o${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f9a24c" />
          <stop offset="1" stopColor="#f07e26" />
        </linearGradient>
        <clipPath id={`c${id}`}>
          <rect x="300" y="35" width="820" height="100" />
        </clipPath>
      </defs>
      <g>
        <rect x="12" y="66" width="48" height="104" rx="3" fill={base} />
        <rect x="222" y="8" width="48" height="106" rx="3" fill={base} />
        <g fill={cut} stroke={cut} strokeWidth="8" strokeLinejoin="round">
          <path d={WAVE_ORANGE} />
          <path d={WAVE_BLUE} />
        </g>
        <path fill={`url(#o${id})`} d={WAVE_ORANGE} />
        <path fill={`url(#b${id})`} d={WAVE_BLUE} />
      </g>
      {!markOnly && (
        <g fill="none" strokeWidth="26" strokeLinejoin="miter" strokeMiterlimit="10" clipPath={`url(#c${id})`}>
          <g stroke={base}>
            <path d="M437 48 H338 V122 H437 M338 85 H425" />
            <path d="M570 61 A52 37 0 1 0 570 109" />
            <path d="M613 30 V140 M748 24 L624 85 L748 146" />
          </g>
          <g stroke="#1e88e5">
            <path d="M750 152 L820 22 L890 152" />
            <path d="M929 30 V140" />
            <path d="M983 140 V48 H1050 A18.5 18.5 0 0 1 1050 85 H994 M1036 85 L1094 143" />
          </g>
        </g>
      )}
    </svg>
  );
}

export { WAVE_BLUE, WAVE_ORANGE };
