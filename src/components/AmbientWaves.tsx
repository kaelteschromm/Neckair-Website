import { WAVE_BLUE, WAVE_ORANGE } from "./Logo";

/**
 * Dezente Hintergrundanimation: die beiden Wellen aus dem Logo,
 * stark vergrößert und weichgezeichnet, driften langsam (reines CSS, GPU-freundlich).
 */
export function AmbientWaves({ className = "", intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 300 178"
        className="absolute -right-[20%] top-[-10%] w-[110%] max-w-none animate-drift blur-3xl will-change-transform md:w-[80%]"
        style={{ opacity: 0.32 * intensity }}
      >
        <path d={WAVE_BLUE} fill="#1e88e5" />
      </svg>
      <svg
        viewBox="0 0 300 178"
        className="absolute -left-[25%] bottom-[-25%] w-[100%] max-w-none animate-drift-slow blur-3xl will-change-transform md:w-[70%]"
        style={{ opacity: 0.22 * intensity }}
      >
        <path d={WAVE_ORANGE} fill="#f07e26" />
      </svg>
    </div>
  );
}
