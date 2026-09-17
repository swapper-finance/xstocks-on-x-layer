import PulseDot from "@/components/ui/PulseDot";
import { DST_CHAIN_ID, TARGET_CHAIN } from "@/config";
import { BRIDGES } from "@/data/bridges";
import { SOURCE_CHAINS } from "@/data/sources";
import type { XStock } from "@/data/xstocks";
import { cn } from "@/lib/cn";

/* The masked 1px ring, longhands only (see ConnectWallet for why). */
const PLATE_RING =
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:p-px after:[background:linear-gradient(to_top,rgba(255,255,255,0),rgba(255,255,255,0.01)_50%,rgba(255,255,255,0.02))] after:[mask-image:linear-gradient(#000_0_0),linear-gradient(#000_0_0)] after:[mask-clip:content-box,border-box] after:[mask-composite:exclude]";

/* The four chains the card names on the source side. The rest of the
   eleven are the "+N" that follows them. */
const SHOWN = SOURCE_CHAINS.slice(0, 4);

type RouteCardProps = {
  stock: XStock;
  className?: string;
};

/* One picture of the whole claim: value enters from any of eleven chains,
   crosses on CCIP, and lands as an xStock on the destination. The packet
   travelling the path is the only thing that moves — the route itself is a
   static edge, because a line that redraws reads as loading, not as
   transport. */
const RouteCard = ({ stock, className }: RouteCardProps) => (
  <div
    className={cn(
      "relative isolate overflow-hidden rounded-[20px] bg-lp-surface-container p-6 lg:p-7",
      PLATE_RING,
      className
    )}
  >
    <div
      aria-hidden
      className="bloom absolute -left-24 top-1/2 h-[320px] w-[320px] -translate-y-1/2 opacity-40"
    />
    <div
      aria-hidden
      className="bloom bloom-settled absolute -right-24 top-1/2 h-[320px] w-[320px] -translate-y-1/2 opacity-40"
    />

    <div className="relative flex items-center justify-between">
      <span className="text-xxs font-semibold uppercase text-white/20">
        Deposit route
      </span>
      <span className="inline-flex items-center gap-2 rounded-[96px] bg-white/[0.03] px-2.5 py-1">
        <PulseDot />
        <span className="text-micro-xxs font-medium text-white/80">Live</span>
      </span>
    </div>

    <div className="relative mt-8 flex items-center justify-between gap-3">
      {/* Source — the eleven chains, stacked */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex -space-x-2">
          {SHOWN.map((chain, i) => (
            <img
              key={chain.chainId}
              src={chain.image}
              alt={chain.name}
              style={{ animationDelay: `${i * 60}ms` }}
              className="h-9 w-9 animate-m-tile rounded-full bg-lp-surface-alt ring-2 ring-lp-surface-container"
            />
          ))}
          <span className="tnum flex h-9 w-9 animate-m-tile items-center justify-center rounded-full bg-lp-surface-alt text-micro-xxs font-medium text-white/60 ring-2 ring-lp-surface-container [animation-delay:240ms]">
            +{SOURCE_CHAINS.length - SHOWN.length}
          </span>
        </div>
        <div className="text-center">
          <p className="text-desc-xs font-medium text-white/80">Any source</p>
          <p className="text-desc-xxs text-white/40">11 chains</p>
        </div>
      </div>

      {/* One lane, because one transfer is sent. Both transports are named
          under it — they are both *quoted*, and the better quote carries the
          leg — but drawing two packets crossing at once would say Swapper
          sends two transfers, which it does not. */}
      <div className="relative flex flex-1 flex-col items-center gap-3">
        <div className="relative h-9 w-full">
          <svg
            aria-hidden
            viewBox="0 0 160 36"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <line
              x1="0"
              y1="18"
              x2="160"
              y2="18"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="animate-route-dash"
            />
          </svg>
          <span
            aria-hidden
            className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-route shadow-[0_0_12px_2px_rgba(132,102,255,0.6)] animate-route-packet"
          />
        </div>

        <div className="flex items-center gap-2">
          {BRIDGES.map((bridge) => (
            <img
              key={bridge.id}
              src={bridge.icon}
              alt={bridge.name}
              title={bridge.name}
              className="h-3.5 w-3.5"
            />
          ))}
          <p className="text-desc-xxs text-white/40">Best quote of 2</p>
        </div>
      </div>

      {/* Destination — the xStock */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <img
            src={stock.image}
            alt=""
            className="h-9 w-9 animate-m-tile rounded-full bg-lp-surface-alt [animation-delay:300ms]"
          />
          <img
            src={TARGET_CHAIN.icon}
            alt=""
            aria-hidden
            className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ring-2 ring-lp-surface-container"
          />
        </div>
        <div className="text-center">
          <p className="tnum text-desc-xs font-medium text-white/80">
            {stock.symbol}
          </p>
          <p className="text-desc-xxs text-white/40">{TARGET_CHAIN.name}</p>
        </div>
      </div>
    </div>

    <div aria-hidden className="relative mt-7 h-px bg-white/5" />

    <dl className="relative mt-5 grid grid-cols-3 gap-4">
      {[
        ["Settles as", stock.symbol],
        ["Bridge", "Best of CCIP / CCTP"],
        ["Steps for user", "One"],
      ].map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1">
          <dt className="text-xxs font-semibold uppercase text-white/20">
            {label}
          </dt>
          <dd className="text-desc-xs text-white/80">{value}</dd>
        </div>
      ))}
    </dl>

    {/* The widget behind the buy button is pointed at the same chain the
        destination above names — so the card can state it plainly. */}
    <p className="relative mt-5 text-desc-xxs text-white/25">
      Settles on {TARGET_CHAIN.name} (chain {DST_CHAIN_ID}), where the xStock
      contracts are live.
    </p>
  </div>
);

export default RouteCard;
