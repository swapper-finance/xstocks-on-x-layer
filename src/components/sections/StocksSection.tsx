import { useMemo, useState } from "react";
import StockCard from "@/components/StockCard";
import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { XSTOCKS } from "@/data/xstocks";
import { cn } from "@/lib/cn";
import { useTokenPrices } from "@/lib/tokenPrices";
import { useInView } from "@/lib/useInView";
import { useSwapper } from "@/swapper/SwapperContext";
import { useWallet } from "@/wallet/WalletContext";

/* How many tiles the grid shows before "Show all". Twelve fills three rows
   at the widest breakpoint, so the cut never lands mid-row. */
const COLLAPSED_COUNT = 12;

const StocksSection = () => {
  const { selected, buy } = useSwapper();
  const { address } = useWallet();
  const { prices, status: priceStatus } = useTokenPrices();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>(0.1);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return XSTOCKS;
    return XSTOCKS.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(needle) ||
        stock.company.toLowerCase().includes(needle) ||
        stock.sector.toLowerCase().includes(needle)
    );
  }, [query]);

  /* A search is always shown in full — collapsing a result set the visitor
     just narrowed would hide the thing they were looking for. */
  const searching = query.trim().length > 0;
  const collapsed = !expanded && !searching && matches.length > COLLAPSED_COUNT;
  const visible = collapsed ? matches.slice(0, COLLAPSED_COUNT) : matches;

  return (
    <Section id="xstocks">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="The catalogue"
          title={`${XSTOCKS.length} xStocks, one deposit flow`}
          description="Every tokenized equity Swapper can settle into. Pick one and the widget opens on it — funded from whatever the user already holds."
        />

        <div className="gradient-border group relative flex w-full rounded-lg md:w-[280px]">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ticker, company, sector"
            aria-label="Search xStocks"
            className="w-full rounded-lg bg-lp-surface-alt/60 px-4 py-2 text-sm text-white/80 placeholder:text-white/40 transition-colors duration-150 focus:outline-none group-hover:placeholder:text-white/60 focus:placeholder:text-white/60"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-desc-sm text-white/40">
          Nothing matches “{query}”. Try a ticker like NVDA, or a sector like
          Semiconductors.
        </p>
      ) : (
        <>
          <div
            ref={ref}
            className={cn(
              "mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
              collapsed && "grid-fade"
            )}
          >
            {visible.map((stock, i) => (
              <StockCard
                key={stock.address}
                stock={stock}
                price={prices[stock.address] ?? null}
                pricePending={priceStatus === "loading"}
                selected={selected?.address === stock.address}
                onBuy={buy}
                disabled={!address}
                className={cn(!inView && "opacity-0", inView && "animate-m-tile")}
                /* Dealt out in order, capped so a long list doesn't end up
                   waiting seconds for its last tile. */
                style={
                  inView ? { animationDelay: `${Math.min(i, 12) * 40}ms` } : undefined
                }
              />
            ))}
          </div>

          {matches.length > COLLAPSED_COUNT && !searching && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="secondary"
                onClick={() => setExpanded((current) => !current)}
              >
                {expanded
                  ? "Show less"
                  : `Show all ${matches.length} xStocks`}
              </Button>
            </div>
          )}
        </>
      )}

      {!address && (
        <p className="mt-8 text-center text-desc-xs text-white/25">
          Connect a wallet to set the deposit address — the xStocks settle
          there.
        </p>
      )}
    </Section>
  );
};

export default StocksSection;
