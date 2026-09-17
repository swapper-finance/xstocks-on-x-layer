/* The source side of the same chains response: every chain a deposit can
   start from, with the number of tokens Swapper routes on it. This is the
   "from Any source" claim, stated as data rather than as copy. */

export type SourceChain = {
  chainId: string;
  name: string;
  ecosystem: "evm" | "solana" | "bitcoin" | "tron";
  /** Native gas token symbol */
  symbol: string;
  image: string;
  /** How many tokens on this chain can fund a deposit */
  tokens: number;
};

export const SOURCE_CHAINS: SourceChain[] = [
  {
    chainId: "1",
    name: "Ethereum",
    ecosystem: "evm",
    symbol: "ETH",
    image: "https://deposit.swapper.finance/assets/chains/ethereum.webp",
    tokens: 715,
  },
  {
    chainId: "56",
    name: "BNB Chain",
    ecosystem: "evm",
    symbol: "BNB",
    image: "https://deposit.swapper.finance/assets/chains/bnb.webp",
    tokens: 313,
  },
  {
    chainId: "137",
    name: "Polygon",
    ecosystem: "evm",
    symbol: "POL",
    image: "https://deposit.swapper.finance/assets/chains/polygon.webp",
    tokens: 140,
  },
  {
    chainId: "8453",
    name: "Base",
    ecosystem: "evm",
    symbol: "ETH",
    image: "https://deposit.swapper.finance/assets/chains/base.webp",
    tokens: 116,
  },
  {
    chainId: "42161",
    name: "Arbitrum",
    ecosystem: "evm",
    symbol: "ETH",
    image: "https://deposit.swapper.finance/assets/chains/arbitrum.webp",
    tokens: 84,
  },
  {
    chainId: "10",
    name: "Optimism",
    ecosystem: "evm",
    symbol: "ETH",
    image: "https://deposit.swapper.finance/assets/chains/optimism.webp",
    tokens: 58,
  },
  {
    chainId: "43114",
    name: "Avalanche",
    ecosystem: "evm",
    symbol: "AVAX",
    image: "https://deposit.swapper.finance/assets/chains/avalanche.webp",
    tokens: 51,
  },
  {
    chainId: "999",
    name: "HyperEVM",
    ecosystem: "evm",
    symbol: "HYPE",
    image: "https://deposit.swapper.finance/assets/chains/hyperevm.webp",
    tokens: 17,
  },
  {
    chainId: "mainnet-beta",
    name: "Solana",
    ecosystem: "solana",
    symbol: "SOL",
    image: "https://deposit.swapper.finance/assets/chains/solana.webp",
    tokens: 4,
  },
  {
    chainId: "728126428",
    name: "Tron",
    ecosystem: "tron",
    symbol: "TRX",
    image: "https://deposit.swapper.finance/assets/chains/tron.webp",
    tokens: 2,
  },
  {
    chainId: "bitcoin",
    name: "Bitcoin",
    ecosystem: "bitcoin",
    symbol: "BTC",
    image: "https://deposit.swapper.finance/assets/chains/bitcoin.webp",
    tokens: 1,
  },
];

export const TOTAL_SOURCE_TOKENS = SOURCE_CHAINS.reduce(
  (sum, chain) => sum + chain.tokens,
  0
);

export const ECOSYSTEM_COUNT = new Set(
  SOURCE_CHAINS.map((chain) => chain.ecosystem)
).size;

/* The three ways money gets in, as the widget itself offers them. Names
   match `SupportedDepositOption` in the SDK. */
export const DEPOSIT_OPTIONS = [
  {
    id: "walletDeposit" as const,
    title: "Connected wallet",
    description:
      "Any token the user already holds, on any of the chains above. Swapper routes and settles it.",
  },
  {
    id: "transferCrypto" as const,
    title: "Transfer from anywhere",
    description:
      "A deposit address or QR the user can pay from an exchange, a hardware wallet, or a phone.",
  },
  {
    id: "depositWithCash" as const,
    title: "Card & bank",
    description:
      "Fiat on-ramp in the same flow, so a first-time buyer never leaves the page to find one.",
  },
];

/* How each `depositOption` reads once the deposit has landed — the way a
   person would describe what they just did, not the SDK's identifier. */
const DEPOSIT_METHOD_LABELS: Record<string, string> = {
  walletDeposit: "via Wallet",
  transferCrypto: "via QR",
  depositWithCash: "with Cash",
  depositFromPolymarket: "from Polymarket",
  depositFromPerps: "from Perps",
};

export const depositMethodLabel = (option: string | undefined | null) =>
  option ? DEPOSIT_METHOD_LABELS[option] ?? null : null;
