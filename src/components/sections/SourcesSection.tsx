import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  DEPOSIT_OPTIONS,
  ECOSYSTEM_COUNT,
  SOURCE_CHAINS,
  TOTAL_SOURCE_TOKENS,
} from "@/data/sources";
import { cn } from "@/lib/cn";
import { useInView } from "@/lib/useInView";

/* The masked 1px ring, longhands only (see ConnectWallet for why). */
const PLATE_RING =
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:p-px after:[background:linear-gradient(to_top,rgba(255,255,255,0),rgba(255,255,255,0.01)_50%,rgba(255,255,255,0.02))] after:[mask-image:linear-gradient(#000_0_0),linear-gradient(#000_0_0)] after:[mask-clip:content-box,border-box] after:[mask-composite:exclude]";

const SourcesSection = () => {
  const [ref, inView] = useInView<HTMLDivElement>(0.15);

  return (
    <Section id="sources">
      <SectionHeading
        eyebrow="Any source"
        title="Eleven chains. Four ecosystems. One destination."
        description={`${TOTAL_SOURCE_TOKENS.toLocaleString("en-US")} tokens across ${SOURCE_CHAINS.length} chains and ${ECOSYSTEM_COUNT} ecosystems can fund an xStock purchase. The user picks what they have; Swapper handles the rest.`}
      />

      <div ref={ref} className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* The chain list, as a single card — a grid of eleven equal tiles
            would read as eleven features rather than as one surface area. */}
        <div
          className={cn(
            "relative flex flex-col gap-5 overflow-hidden rounded-[20px] bg-lp-surface-container p-6 sm:col-span-2 lg:p-7",
            PLATE_RING,
            inView ? "animate-card-rise" : "opacity-0"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-[96px] bg-white/85 px-2.5 py-1 text-micro-xxs font-medium text-lp-surface-base">
              Deposit from
            </span>
            <span className="tnum font-mono text-mono-xxs text-white/40">
              {SOURCE_CHAINS.length} chains
            </span>
          </div>

          <ul className="flex flex-col gap-1">
            {SOURCE_CHAINS.map((chain, i) => (
              <li
                key={chain.chainId}
                style={
                  inView ? { animationDelay: `${120 + i * 40}ms` } : undefined
                }
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors duration-150 hover:bg-white/[0.03]",
                  inView ? "animate-m-left" : "opacity-0"
                )}
              >
                <img
                  src={chain.image}
                  alt=""
                  loading="lazy"
                  className="h-7 w-7 shrink-0 rounded-full bg-lp-surface-alt"
                />
                <span className="text-xs font-medium text-white">
                  {chain.name}
                </span>
                <span className="rounded-[96px] bg-white/[0.03] px-2 py-0.5 text-micro-xxs font-medium uppercase text-white/40">
                  {chain.ecosystem}
                </span>
                <span className="tnum ml-auto font-mono text-mono-xxs text-white/40">
                  {chain.tokens.toLocaleString("en-US")} tokens
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* The three ways in, as the widget itself offers them */}
        <div className="flex flex-col gap-3">
          {DEPOSIT_OPTIONS.map((option, i) => (
            <div
              key={option.id}
              style={inView ? { animationDelay: `${120 + i * 120}ms` } : undefined}
              className={cn(
                "relative flex flex-1 flex-col gap-2 overflow-hidden rounded-[20px] bg-lp-surface-container p-6",
                PLATE_RING,
                inView ? "animate-card-rise" : "opacity-0"
              )}
            >
              <p className="font-mono text-mono-xxs uppercase text-white/25">
                {option.id}
              </p>
              <p className="text-sm font-medium text-white">{option.title}</p>
              <p className="text-desc-xs text-white/40">{option.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default SourcesSection;
