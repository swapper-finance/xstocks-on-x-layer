import RouteSelection from "@/components/RouteSelection";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { TARGET_CHAIN } from "@/config";
import { BRIDGES, ROUTING_STEPS } from "@/data/bridges";
import { cn } from "@/lib/cn";
import { useInView } from "@/lib/useInView";

const PLATE_RING =
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:p-px after:[background:linear-gradient(to_top,rgba(255,255,255,0),rgba(255,255,255,0.01)_50%,rgba(255,255,255,0.02))] after:[mask-image:linear-gradient(#000_0_0),linear-gradient(#000_0_0)] after:[mask-clip:content-box,border-box] after:[mask-composite:exclude]";

const RoutingSection = () => {
  const [ref, inView] = useInView<HTMLDivElement>(0.15);

  return (
    <Section id="routing">
      <SectionHeading
        eyebrow="The cross-chain leg"
        title="Two bridges quoted. The better quote wins."
        description="Swapper doesn't pick a bridge and hope. Every cross-chain deposit is quoted over Chainlink CCIP and Circle CCTP, the two quotes are compared, and the better one is executed. One comparison, one transfer."
      />

      <div ref={ref} className="mt-12 flex flex-col gap-3">
        {/* The comparison */}
        <div
          className={cn(
            "relative overflow-hidden rounded-[20px] bg-lp-surface-container p-6 lg:p-8",
            PLATE_RING,
            inView ? "animate-card-rise" : "opacity-0"
          )}
        >
          <div
            aria-hidden
            className="bloom absolute left-1/2 top-0 h-[360px] w-[620px] -translate-x-1/2 -translate-y-1/2 opacity-50"
          />

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <span className="text-xxs font-semibold uppercase text-white/20">
              Live route selection
            </span>
            <span className="rounded-[96px] bg-white/85 px-2.5 py-1 text-micro-xxs font-medium text-lp-surface-base">
              Best quote of two
            </span>
          </div>

          <RouteSelection className="relative mt-6" />
        </div>

        {/* The two transports, side by side */}
        <div className="grid gap-3 md:grid-cols-2">
          {BRIDGES.map((bridge, i) => (
            <div
              key={bridge.id}
              style={inView ? { animationDelay: `${160 + i * 120}ms` } : undefined}
              className={cn(
                "relative flex flex-col gap-5 overflow-hidden rounded-[20px] bg-lp-surface-container p-6 lg:p-7",
                PLATE_RING,
                inView ? "animate-card-rise" : "opacity-0"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={bridge.icon} alt="" className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {bridge.name}
                    </p>
                    <p className="text-desc-xs text-white/40">
                      {bridge.tagline}
                    </p>
                  </div>
                </div>
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: bridge.hex }}
                  aria-hidden
                />
              </div>

              <ul className="flex flex-col gap-2.5">
                {bridge.strengths.map((strength) => (
                  <li key={strength} className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-white/25"
                    />
                    <span className="text-desc-xs text-white/40">
                      {strength}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                <span className="text-xxs font-semibold uppercase text-white/20">
                  Carries
                </span>
                <span className="text-desc-xs text-white/80">
                  {bridge.carries}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* What the router actually does, in order */}
        <div
          style={inView ? { animationDelay: "400ms" } : undefined}
          className={cn(
            "relative overflow-hidden rounded-[20px] bg-lp-surface-container",
            PLATE_RING,
            inView ? "animate-card-rise" : "opacity-0"
          )}
        >
          <ol className="grid gap-px bg-white/5 md:grid-cols-4">
            {ROUTING_STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex flex-col gap-3 bg-lp-surface-container p-6"
              >
                <span className="tnum font-mono text-mono-xxs text-white/25">
                  0{i + 1}
                </span>
                <p className="text-xs font-medium text-white">{step.title}</p>
                <p className="text-desc-xs text-white/40">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="mt-6 text-desc-xs text-white/25">
        Whichever quote wins, the user signs once and never names a bridge.
        The xStock arrives on {TARGET_CHAIN.name} in the wallet they
        connected.
      </p>
    </Section>
  );
};

export default RoutingSection;
