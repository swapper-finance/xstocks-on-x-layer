import RouteCard from "@/components/RouteCard";
import Button, { buttonStyles } from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Section from "@/components/ui/Section";
import { TARGET_CHAIN } from "@/config";
import { BRIDGES } from "@/data/bridges";
import { ECOSYSTEM_COUNT, SOURCE_CHAINS, TOTAL_SOURCE_TOKENS } from "@/data/sources";
import { XSTOCKS } from "@/data/xstocks";
import { useSwapper } from "@/swapper/SwapperContext";
import { useWallet } from "@/wallet/WalletContext";

const STATS = [
  { value: `${XSTOCKS.length}`, label: "xStocks" },
  { value: `${SOURCE_CHAINS.length}`, label: "Source chains" },
  { value: TOTAL_SOURCE_TOKENS.toLocaleString("en-US"), label: "Source tokens" },
  { value: `${ECOSYSTEM_COUNT}`, label: "Ecosystems" },
];

const HeroSection = () => {
  const { selected, buy, ready } = useSwapper();
  const { address } = useWallet();

  return (
    <Section id="top" className="pt-10 md:pt-14 lg:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-16">
        <div className="flex flex-col items-start">
          <Chip className="animate-m-rise">
            <span className="flex items-center gap-1.5">
              {BRIDGES.map((bridge) => (
                <img
                  key={bridge.id}
                  src={bridge.icon}
                  alt=""
                  className="h-3.5 w-3.5"
                />
              ))}
            </span>
            <span className="text-micro-xxs font-medium text-white/60">
              Backed by Chainlink CCIP + Circle CCTP
            </span>
          </Chip>

          <h1 className="text-metallic mt-6 max-w-[620px] animate-m-rise text-display-md font-medium [animation-delay:60ms] md:text-display-lg">
            Buy xStocks with anything you already hold.
          </h1>

          <p className="mt-4 max-w-[496px] animate-m-rise text-desc-sm text-white/40 [animation-delay:120ms] md:mt-6">
            Swapper is the deposit kit for tokenized equities on{" "}
            {TARGET_CHAIN.name}. Your users arrive with BTC, SOL, USDT on Tron,
            or a bank card — and leave holding the stock. Every cross-chain leg
            is quoted over both Chainlink CCIP and Circle CCTP, and the better
            quote is the one that gets executed.
          </p>

          <div className="mt-8 flex animate-m-rise flex-wrap items-center gap-3 [animation-delay:180ms]">
            <Button
              onClick={() => selected && buy(selected)}
              disabled={!address || !selected || !ready}
            >
              {address
                ? `Buy ${selected?.company ?? "xStock"}`
                : "Connect wallet to buy"}
            </Button>
            <a href="#xstocks" className={buttonStyles("secondary")}>
              Browse {XSTOCKS.length} xStocks
            </a>
          </div>

          <dl className="mt-12 grid w-full animate-m-rise grid-cols-2 gap-x-8 gap-y-6 [animation-delay:240ms] sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="tnum text-xl font-medium text-white">
                  {stat.value}
                </dt>
                <dd className="text-xxs font-semibold uppercase text-white/20">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {selected && (
          <RouteCard
            stock={selected}
            className="animate-m-rise [animation-delay:120ms]"
          />
        )}
      </div>
    </Section>
  );
};

export default HeroSection;
