import Button from "@/components/ui/Button";
import Section from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import { useInView } from "@/lib/useInView";
import { useSwapper } from "@/swapper/SwapperContext";
import { useWallet } from "@/wallet/WalletContext";

const CtaSection = () => {
  const { selected, buy, ready } = useSwapper();
  const { address } = useWallet();
  const [ref, inView] = useInView<HTMLDivElement>(0.3);

  return (
    <Section id="cta">
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col items-center text-center",
          inView ? "animate-card-rise" : "opacity-0"
        )}
      >
        <div
          aria-hidden
          className="bloom absolute left-1/2 top-1/2 h-[360px] w-[560px] -translate-x-1/2 -translate-y-1/2 opacity-40"
        />

        <h2 className="text-metallic relative max-w-[520px] text-display-sm font-medium md:text-display-md">
          Your users already hold something. Let them buy the stock with it.
        </h2>

        <p className="relative mt-3 max-w-[440px] text-desc-sm text-white/40 md:mt-4">
          Swapper turns every chain, every token and every card into a funded
          xStock position — without asking the user to learn a bridge.
        </p>

        <div className="relative mt-8">
          <Button
            onClick={() => selected && buy(selected)}
            disabled={!address || !selected || !ready}
          >
            {address
              ? `Buy ${selected?.company ?? "xStock"}`
              : "Connect wallet to buy"}
          </Button>
        </div>
      </div>
    </Section>
  );
};

export default CtaSection;
