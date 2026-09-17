import logo from "@/assets/icons/swapper-logo.svg";
import Container from "@/components/ui/Container";
import { TARGET_CHAIN } from "@/config";
import { BRIDGES } from "@/data/bridges";

const Footer = () => (
  <footer className="border-t border-white/5">
    <Container className="flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-4">
        <img src={logo} alt="Swapper" className="h-8 w-8 opacity-60" />
        <p className="max-w-[320px] text-desc-xs text-white/40">
          A demo of Swapper Finance as the deposit kit for xStocks. Built for
          OKX Dev Day.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-10 gap-y-4">
        <div className="flex flex-col gap-1">
          <dt className="text-xxs font-semibold uppercase text-white/20">
            Destination
          </dt>
          <dd className="font-mono text-mono-xxs text-white/60">
            {TARGET_CHAIN.name}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xxs font-semibold uppercase text-white/20">
            Bridges
          </dt>
          <dd className="font-mono text-mono-xxs text-white/60">
            {BRIDGES.map((bridge) => bridge.name).join(" · ")}
          </dd>
        </div>
      </dl>
    </Container>

    <Container className="border-t border-white/5 py-6">
      <p className="text-desc-xxs text-white/25">
        Demo only. Prices shown on this page are indicative placeholders, not
        market data. xStocks are tokenized equity products issued by third
        parties; nothing here is investment advice or an offer to sell.
      </p>
    </Container>
  </footer>
);

export default Footer;
