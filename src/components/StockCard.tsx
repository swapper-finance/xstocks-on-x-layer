import type { XStock } from "@/data/xstocks";
import { cn } from "@/lib/cn";
import { formatPercent, formatUsd } from "@/lib/format";

type StockCardProps = {
  stock: XStock;
  /** Live USD price from the feed; null while it loads, or if it has none */
  price: number | null;
  /** The feed's first read is still in flight — the price reads as pending */
  pricePending: boolean;
  selected: boolean;
  onBuy: (stock: XStock) => void;
  /** Reads "Connect wallet to buy" instead, and does nothing on click */
  disabled: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/* One xStock. The whole tile is the button: a card with a separate small
   "Buy" target inside it gives the eye two things to aim at for one
   action. The label appears on hover and focus so the affordance is still
   stated, just not competing with the price. */
const StockCard = ({
  stock,
  price,
  pricePending,
  selected,
  onBuy,
  disabled,
  className,
  style,
}: StockCardProps) => {
  const up = stock.change24h >= 0;

  return (
    <button
      type="button"
      onClick={() => onBuy(stock)}
      disabled={disabled}
      aria-label={
        disabled
          ? `Connect a wallet to buy ${stock.name}`
          : `Buy ${stock.name}`
      }
      style={style}
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-[20px] bg-lp-surface-container p-5 text-left",
        "[transition:background-color_150ms_ease-out,transform_300ms_cubic-bezier(0.34,1.3,0.64,1)]",
        "hover:bg-white/[0.05] active:scale-[0.98] active:[transition:transform_150ms_cubic-bezier(0.25,0.1,0.25,1)]",
        "disabled:cursor-not-allowed disabled:hover:bg-lp-surface-container disabled:active:scale-100",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        selected && "bg-white/[0.05]",
        className
      )}
    >
      {selected && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-accent-route/40"
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <img
          src={stock.image}
          alt=""
          loading="lazy"
          className="h-10 w-10 shrink-0 rounded-full bg-lp-surface-alt"
        />
        <span
          className={cn(
            "tnum shrink-0 rounded-[96px] px-2 py-0.5 text-micro-xxs font-medium",
            up
              ? "bg-accent-settled/10 text-accent-settled"
              : "bg-[#f44336]/10 text-[#f44336]"
          )}
        >
          {formatPercent(stock.change24h)}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-white">
          {stock.company}
        </p>
        <p className="tnum truncate font-mono text-mono-xxs text-white/40">
          {stock.symbol} · {stock.sector}
        </p>
      </div>

      <div className="mt-auto flex items-end justify-between gap-2">
        {/* Three states, because a price the feed doesn't carry must not
            read as a price it does: a figure, a pending dash while the
            first read is in flight, and a plain dash for a token the feed
            has no source for (SHEINx, at the time of writing). */}
        {price === null ? (
          <span
            className={cn(
              "tnum text-md font-medium text-white/30",
              pricePending && "animate-m-dim"
            )}
            title={pricePending ? "Fetching price…" : "No price feed"}
          >
            $—
          </span>
        ) : (
          <span className="tnum text-md font-medium text-white/80">
            {formatUsd(price)}
          </span>
        )}
        <span
          className={cn(
            "text-desc-xxs font-medium opacity-0 [transition:opacity_150ms_ease-out]",
            !disabled && "group-hover:opacity-100 group-focus-visible:opacity-100",
            "text-white/60"
          )}
        >
          Buy →
        </span>
      </div>
    </button>
  );
};

export default StockCard;
