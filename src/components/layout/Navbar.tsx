import wordmark from "@/assets/icons/swapper-wordmark.svg";
import ConnectWallet from "@/components/ConnectWallet";
import Container from "@/components/ui/Container";
import { TARGET_CHAIN } from "@/config";

const LINKS = [
  { label: "xStocks", href: "#xstocks" },
  { label: "Any source", href: "#sources" },
  { label: "Routing", href: "#routing" },
  { label: "Integrate", href: "#integrate" },
];

const Navbar = () => (
  <header className="sticky top-0 z-50">
    {/* The blur lives on the bar rather than the header: a backdrop-filter
        makes its element a containing block for fixed descendants, which
        would trap the wallet menu inside it. */}
    <div className="grain relative z-10 bg-lp-surface-base/90 backdrop-blur-[72px]">
      <Container className="flex h-20 items-center gap-10">
        <a href="#top" className="shrink-0 mix-blend-luminosity">
          <img src={wordmark} alt="Swapper" className="h-8 w-[101px]" />
        </a>

        <span className="hidden items-center gap-2 rounded-[96px] bg-white/[0.03] px-2.5 py-1 lg:inline-flex">
          <span className="text-micro-xxs font-medium text-white/80">
            xStocks on {TARGET_CHAIN.name}
          </span>
        </span>

        <nav className="hidden flex-1 items-center justify-end gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-white opacity-60 transition-opacity duration-150 hover:opacity-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto md:ml-0">
          <ConnectWallet />
        </div>
      </Container>
    </div>
  </header>
);

export default Navbar;
