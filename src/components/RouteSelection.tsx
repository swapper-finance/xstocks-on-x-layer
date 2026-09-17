import { useEffect, useState } from "react";
import { BRIDGES } from "@/data/bridges";
import { cn } from "@/lib/cn";

/* Route selection, as a loop.

   The thing being shown is a *comparison*, not a race: both transports are
   asked for a quote on the same leg, the better quote is chosen, and only
   that one is executed. The losing route is never started — so only the
   chosen lane ever draws a packet. Drawing both moving at once would say
   Swapper sends two transfers, which is not what happens.

   The winner alternates between rounds so it is clear the outcome is
   decided by the quotes on the day, not fixed per protocol. */

type Phase = "asking" | "quoted" | "executing" | "settled";

const ASK_MS = 1100;
/* How long both quotes sit side by side before one is picked — this is the
   beat the whole component exists for, so it is not rushed. */
const COMPARE_MS = 1500;
const HOLD_MS = 2200;

/* Each round is the two quotes. Everything else is read off them: the
   chosen route is whichever returns more on the other side, and that
   route's own ETA is how long its packet takes to cross.

   One source of truth on purpose — an earlier cut declared a winner
   separately from the quoted numbers and the two drifted apart, so the card
   showed a lane winning while quoting worse figures than the lane it beat. */
const ROUNDS = [
  {
    ccip: { out: "99.42", fee: "$0.58", ms: 2500 },
    cctp: { out: "99.81", fee: "$0.19", ms: 4300 },
  },
  {
    ccip: { out: "99.76", fee: "$0.24", ms: 2900 },
    cctp: { out: "99.55", fee: "$0.45", ms: 3600 },
  },
  {
    ccip: { out: "99.38", fee: "$0.62", ms: 4100 },
    cctp: { out: "99.84", fee: "$0.16", ms: 2900 },
  },
];

const formatEta = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

const usesReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const RouteSelection = ({ className }: { className?: string }) => {
  const [still] = useState(usesReducedMotion);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>(still ? "settled" : "asking");

  const quote = ROUNDS[round % ROUNDS.length];
  /* More delivered on the other side is the better quote */
  const chosenId =
    Number(quote.ccip.out) >= Number(quote.cctp.out) ? "ccip" : "cctp";
  const chosenMs = quote[chosenId].ms;

  useEffect(() => {
    if (still) return;

    const timers = [
      window.setTimeout(() => setPhase("quoted"), ASK_MS),
      window.setTimeout(() => setPhase("executing"), ASK_MS + COMPARE_MS),
      window.setTimeout(
        () => setPhase("settled"),
        ASK_MS + COMPARE_MS + chosenMs
      ),
      window.setTimeout(
        () => {
          setRound((current) => current + 1);
          setPhase("asking");
        },
        ASK_MS + COMPARE_MS + chosenMs + HOLD_MS
      ),
    ];

    return () => timers.forEach(clearTimeout);
    /* `round` restarts the chain; the cleanup cancels the old one */
  }, [round, still, chosenMs]);

  const decided = phase === "executing" || phase === "settled";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <ul className="flex flex-col gap-2">
        {BRIDGES.map((bridge) => {
          const lane = quote[bridge.id];
          const chosen = bridge.id === chosenId;
          /* Only the chosen route is ever executed, so only it draws */
          const runs = decided && chosen;

          return (
            <li
              key={bridge.id}
              className={cn(
                "flex flex-col gap-3 rounded-[10px] px-3 py-3 [transition:opacity_400ms_ease-out,background-color_400ms_ease-out] sm:grid sm:grid-cols-[minmax(0,184px)_minmax(0,1fr)_minmax(0,116px)] sm:items-center sm:gap-4",
                decided && !chosen ? "opacity-30" : "opacity-100",
                decided && chosen && "bg-white/[0.03]"
              )}
            >
              {/* Who, and what they quoted */}
              <div className="flex items-center gap-2.5">
                <img src={bridge.icon} alt="" className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white">
                    {bridge.name}
                  </p>
                  <p className="tnum truncate font-mono text-mono-xxs text-white/40">
                    {phase === "asking" ? (
                      <span className="animate-m-dim">quoting…</span>
                    ) : (
                      `${lane.out} USDC · ${lane.fee} · ${formatEta(lane.ms)}`
                    )}
                  </p>
                </div>
              </div>

              {/* The lane. Empty until this route is the one chosen. */}
              <div className="relative h-7">
                <svg
                  aria-hidden
                  viewBox="0 0 200 28"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                >
                  <line
                    x1="0"
                    y1="14"
                    x2="200"
                    y2="14"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                </svg>

                {/* Keyed by round so every round starts from a fresh
                    element at 0% rather than resuming the last one. */}
                {runs && (
                  <>
                    <span
                      key={`fill-${round}`}
                      aria-hidden
                      style={{
                        animationDuration: `${lane.ms}ms`,
                        backgroundColor: bridge.hex,
                      }}
                      className="absolute left-0 top-1/2 h-px -translate-y-1/2 animate-lane-fill opacity-50"
                    />
                    <span
                      key={`packet-${round}`}
                      aria-hidden
                      style={{
                        animationDuration: `${lane.ms}ms`,
                        backgroundColor: bridge.hex,
                        boxShadow: `0 0 12px 2px ${bridge.hex}66`,
                      }}
                      className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 animate-lane-run rounded-full"
                    />
                  </>
                )}
              </div>

              {/* What was decided */}
              <div className="sm:text-right">
                {phase === "asking" && (
                  <span className="animate-m-fade font-mono text-mono-xxs uppercase text-white/25">
                    Asking
                  </span>
                )}
                {phase === "quoted" && (
                  <span className="animate-m-fade font-mono text-mono-xxs uppercase text-white/40">
                    Quoted
                  </span>
                )}
                {decided &&
                  (chosen ? (
                    <span className="inline-flex animate-m-up-sm items-center gap-1.5 sm:justify-end">
                      {phase === "settled" && (
                        <svg
                          viewBox="0 0 12 12"
                          aria-hidden
                          className="h-3 w-3 text-accent-settled"
                        >
                          <path
                            d="M2.5 6.2l2.4 2.4 4.6-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <span
                        className={cn(
                          "font-mono text-mono-xxs uppercase",
                          phase === "settled"
                            ? "text-accent-settled"
                            : "text-white/80"
                        )}
                      >
                        {phase === "settled" ? "Settled" : "Executing"}
                      </span>
                    </span>
                  ) : (
                    <span className="animate-m-fade font-mono text-mono-xxs uppercase text-white/25">
                      Not used
                    </span>
                  ))}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="px-3 text-desc-xxs text-white/25">
        Illustrative loop on a 100 USDC leg — the better quote alternates to
        show the choice is made per deposit, not fixed per protocol. Only the
        chosen route is ever executed. Figures are placeholders, not
        measurements.
      </p>
    </div>
  );
};

export default RouteSelection;
