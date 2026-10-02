/* Emits src/data/xstocks.ts. Addresses come straight out of the Swapper
   chains response so nothing is transcribed by hand; the sector/change
   columns are the demo-only metadata this app adds on top.

   There is deliberately no price column: prices are read at runtime from
   /api/tokenPrices (see src/lib/tokenPrices.ts). A baked-in price drifts,
   and this one did — 26 of the 43 ended up more than 20% off the feed.

   The source is the X Layer document from the Swapper chains collection
   (an array holding the chain-196 entry). Its xStocks are the native X Layer
   tokens — an earlier source listed the wrapped `wNVDAx` versions, whose
   addresses were wrong to settle into. `image` is still the API's value as
   is; its filename may name the old wrapped token, but it is a real asset. */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "C:/Users/krzys/Downloads/Telegram Desktop/swapper-prod.chains-xlayer.json";
const OUT = new URL("../src/data/xstocks.ts", import.meta.url);

/* symbol -> [sector, indicative 24h % change]. Price is NOT here — it
   comes from the live feed at runtime. */
const META = {
  NVDAx: ["Semiconductors", 1.84],
  AAPLx: ["Consumer Tech", 0.42],
  MSFTx: ["Software", -0.31],
  GOOGLx: ["Internet", 1.12],
  AMZNx: ["E-Commerce", 0.67],
  METAx: ["Internet", -0.88],
  TSLAx: ["Automotive", 2.41],
  AVGOx: ["Semiconductors", 1.05],
  AMDx: ["Semiconductors", 2.07],
  TSMx: ["Semiconductors", 1.46],
  MUx: ["Semiconductors", 2.74],
  SKHYx: ["Semiconductors", 1.93],
  ASMLx: ["Semicap", 0.94],
  ORCLx: ["Software", -1.24],
  PLTRx: ["Software", 3.02],
  INTCx: ["Semiconductors", -0.95],
  MRVLx: ["Semiconductors", 1.37],
  IBMx: ["Enterprise IT", -0.41],
  DELLx: ["Enterprise IT", 0.61],
  SNDKx: ["Storage", 4.35],
  COINx: ["Crypto", 4.16],
  HOODx: ["Fintech", 3.55],
  CRCLx: ["Stablecoins", 2.87],
  MSTRx: ["Bitcoin Treasury", 3.94],
  BMNRx: ["Ethereum Treasury", 5.21],
  GMEx: ["Retail", -2.18],
  MCDx: ["Consumer", 0.11],
  KOx: ["Consumer", 0.34],
  MIXUx: ["Consumer", 2.05],
  POPMTx: ["Consumer", 3.42],
  XIAOx: ["Consumer Electronics", -1.08],
  SHEINx: ["E-Commerce", 1.47],
  MEITx: ["E-Commerce", -1.62],
  TCENTx: ["Internet", 1.24],
  KUAIx: ["Internet", 2.31],
  SPCXx: ["Aerospace", 2.6],
  "BRK.Bx": ["Conglomerate", 0.21],
  HKEXCx: ["Exchanges", 0.86],
  ICEx: ["Exchanges", 0.38],
  SPYx: ["Index", 0.48],
  QQQx: ["Index", 0.71],
  IWMx: ["Index", 0.33],
  SLVx: ["Commodity", 1.29],
};

/* The eight the grid leads with — the names an audience recognises before
   they read the label. Everything else follows alphabetically. */
const FEATURED = [
  "NVDAx",
  "TSLAx",
  "AAPLx",
  "MSFTx",
  "COINx",
  "SPYx",
  "GOOGLx",
  "METAx",
];

const chain = JSON.parse(readFileSync(SRC, "utf8")).find(
  (c) => c.chainId === "196"
);
if (!chain) throw new Error("no X Layer (196) entry in source");
const raw = chain.tokens.filter((t) => t.name.includes("xStock"));

const missing = raw.filter((t) => !META[t.symbol]).map((t) => t.symbol);
if (missing.length) throw new Error(`no META for: ${missing.join(", ")}`);

const rank = (s) => {
  const i = FEATURED.indexOf(s);
  return i === -1 ? FEATURED.length : i;
};
raw.sort(
  (a, b) => rank(a.symbol) - rank(b.symbol) || a.symbol.localeCompare(b.symbol)
);

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const rows = raw
  .map((t) => {
    const [sector, change] = META[t.symbol];
    return `  {
    symbol: "${t.symbol}",
    name: "${esc(t.name)}",
    company: "${esc(t.name.replace(/ xStock$/, ""))}",
    address: "${t.address}",
    decimals: ${t.decimals},
    image: "${t.image}",
    sector: "${sector}",
    change24h: ${change},
  },`;
  })
  .join("\n");

writeFileSync(
  OUT,
  `/* The ${raw.length} xStocks Swapper can settle into on X Layer, taken from the
   chains response — address, decimals and logo are the API's own values.

   These are the native X Layer xStocks, not the wrapped \`wNVDAx\` tokens
   an earlier source listed.

   There is no \`price\` field: the grid reads prices at runtime from
   /api/tokenPrices via src/lib/tokenPrices.ts, which is the same feed the
   deposit widget prices against. Baked-in prices drift — these did.

   \`sector\` and \`change24h\` are still NOT from the API. They are
   indicative demo figures. The feed carries no 24h change, so the badge on
   each tile remains illustrative while the price beside it is live.

   Generated; edit the generator rather than this file. */

export type XStock = {
  /** "NVDAx" */
  symbol: string;
  /** "NVIDIA xStock" */
  name: string;
  /** "NVIDIA" — the name without the xStock suffix, for headings */
  company: string;
  /** Lowercase, as the API returns it. Goes straight to \`dstTokenAddr\`. */
  address: string;
  decimals: number;
  image: string;
  sector: string;
  /** Indicative only — see the note at the top of this file. */
  change24h: number;
};

export const XSTOCKS: XStock[] = [
${rows}
];

export const findXStock = (address: string) =>
  XSTOCKS.find((s) => s.address.toLowerCase() === address.toLowerCase());
`,
  "utf8"
);

console.log(`wrote ${raw.length} xStocks`);
