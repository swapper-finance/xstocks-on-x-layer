# Swapper × xStocks — deposit kit demo

Built for OKX Dev Day. The claim it makes: **Swapper is the seamless deposit
kit for xStock purchases on X Layer, funded from any source, with the
cross-chain leg quoted over both Chainlink CCIP and Circle CCTP — the better
quote is the one that gets executed.**

A visitor connects a wallet, picks one of 43 tokenized equities, and the
Swapper widget opens already loaded — funded from whatever they hold on any
of 11 chains across 4 ecosystems, or from a card. The xStock settles on
**X Layer (chain 196)**; the integration runs against that lane, not a
stand-in.

```bash
npm install
npm run dev      # http://localhost:3002
```

## What it demonstrates

|                       |                                                                                                                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `preloadSwapperModal` | The widget is built hidden and fully loaded on mount, so the first `open()` is instant instead of a blank iframe booting. Smart-wallet authorization stays deferred until that first open, so visitors who never buy never get one. |
| `open(patch)`         | The destination token and the deposit wallet both change after the preload, so they ride in as a config patch applied to the live widget right before it becomes visible.                                                           |
| `updateSigner`        | The wallet connected on the page is handed to the widget, so the visitor isn't asked to connect twice. `null` on disconnect.                                                                                                        |
| `onEvent`             | `transaction_success` drives the receipt strip at the bottom of the page — amount, token, deposit method, explorer link. No polling.                                                                                                |
| Wallet connect        | EIP-6963 discovery, no wallet library. The connected address becomes `depositWalletAddress`.                                                                                                                                        |
| Live prices           | The catalogue reads `/api/tokenPrices` for chain 196 — the same feed the widget prices against.                                                                                                                                     |

## The two bridges

Swapper asks **Chainlink CCIP** and **Circle CCTP** for a quote on the same
cross-chain leg, compares what comes back, and executes the better one.
**Only one transfer is ever sent** — the route that loses the comparison is
never started. Where only one transport can carry the leg at all (CCTP moves
native USDC and nothing else), that one takes it uncontested.

The `#routing` section animates the comparison
(`src/components/RouteSelection.tsx`). Three things about it are deliberate:

- **Only the chosen lane draws a packet.** Two packets crossing at once
  would say Swapper sends two transfers. It doesn't.
- **The better quote alternates.** Watch it twice and you see the choice is
  made per deposit, not fixed per protocol.
- **The quotes are the single source of truth.** Each round in `ROUNDS` is
  just the two quotes; which route is chosen, what's displayed, and how long
  the packet takes to cross are all derived from them. An earlier cut
  declared a winner separately from the numbers and the two drifted apart —
  the card showed a lane winning while quoting worse figures than the lane
  it beat.

The amounts, fees and times in that loop are **placeholders, not
measurements**, and the component says so on screen.

### Modal height

`SwapperModal` always builds its
iframe with `flexibleHeight: true` and animates the container to the
widget's reported height (clamped to 90vh). `MODAL_STYLE.height` is
therefore only the height the modal _opens_ at, before the first resize
message lands; it is set near the home screen's real height so the first
open doesn't visibly settle from the SDK's 560px default.

## Configuration

Everything lives in [`src/config.ts`](src/config.ts).

```ts
integratorId: "97913d689a12694325cc"
dstChainId:   "196"                                          // X Layer
dstTokenAddr: "0xc845b2894dbddd03858fd2d643b4ef725fe0849d"   // NVDAx, default
depositWalletAddress: <the connected wallet>
```

The widget is not preloaded until a wallet is connected — it is then built
against that wallet's address, so `depositWalletAddress` is never a
placeholder or the zero address. Switching accounts rebuilds it for the new
one; disconnecting tears it down, and the buy button stays disabled until a
wallet is connected and the preload has started.

`CHAIN_EXPLORER` is OKLink's X Layer explorer, used for the receipt's
transaction link when the widget's event doesn't carry an `explorerUrl` of
its own.

## Contracts

The two Swapper contracts the deposit settles through on X Layer, both
verified on XLayerScan:

| Contract | Address                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| Executor | [`0x7bc7942E589C85ca9ac78CD8d2E53E9DE58a5Ec7`](https://xlayerscan.com/address/0x7bc7942E589C85ca9ac78CD8d2E53E9DE58a5Ec7) |
| Router   | [`0xE19C93AD01E0DaCBf47D4acae3Ba47087026F895`](https://xlayerscan.com/address/0xE19C93AD01E0DaCBf47D4acae3Ba47087026F895) |

Neither address appears in this repo — the widget resolves them itself. They
are here so the on-chain side of a demo deposit can be read back.

## Data

- `src/data/xstocks.ts` — all 43 xStocks on X Layer, **generated** by
  `scripts/gen-xstocks.mjs` from the Swapper chains response so no address
  is transcribed by hand. Address, decimals and logo are the API's own
  values.
- `src/data/sources.ts` — the 11 source chains and their token counts, the
  three `depositOption`s, and how each one reads on the receipt.
- `src/data/bridges.ts` — CCIP and CCTP, and the four steps the router takes.

### Native tokens, not wrapped

The addresses are the native X Layer xStocks. An earlier source listed the
bridged `wNVDAx` / "Wrapped NVIDIA xStock" versions instead, which are the
wrong tokens to settle into. `image` is still the API's value as is; some
filenames still name the old wrapped token, but they are real asset paths.

### Prices are live, the rest of the badge isn't

Prices come from the `/api/tokenPrices` feed at runtime
([`src/lib/tokenPrices.ts`](src/lib/tokenPrices.ts)), refreshed every 60s,
with a token the feed has no source for rendered as no price rather than as
a $0.00 stock. The data file carries no `price` column at all: it used to
hold indicative figures, they drifted, and by launch day 26 of the 43 were
more than 20% off — one by 2.6x.

`sector` and `change24h` are still **indicative demo figures, not market
data** — the feed carries no 24h change, so that badge stays illustrative
while the price beside it is live. The deposit itself is real; the widget
prices the swap at execution time.

## Wallet connect

EIP-6963 (`eip6963:announceProvider`) discovery with a `window.ethereum`
fallback, in [`src/wallet/WalletContext.tsx`](src/wallet/WalletContext.tsx).
Roughly 250 lines, zero dependencies, and no WalletConnect project id to
provision — which is itself part of the pitch: the _deposit_ side needs
neither a connector kit nor a bridge UI.

The connected address is used as `depositWalletAddress`, and the provider is
wrapped in `src/wallet/Eip1193Signer.ts` and handed to the widget via
`modal.updateSigner(...)` so the same wallet signs the deposit.

That adapter is shaped as an **ethers v5 signer**, not as the SDK's own
`SwapperSigner`, and the comment at the top of the file explains why:
`createSwapperSigner` duck-types in a fixed order and `isEthersV5Signer`
matches before `isSwapperSigner` is ever reached, so a SwapperSigner-shaped
object lands in `EthersV5SignerAdapter` regardless — and that adapter reaches
for `provider.send()`. Meeting the v5 contract properly is the honest way to
satisfy it; an EIP-1193 `request({ method, params })` _is_ `provider.send`.

The widget still runs its own connection flow for the **source** side when it
needs one, which is what lets a deposit start on Solana or Bitcoin while the
destination stays an X Layer address.

## Design

Tokens, fonts and component idioms are lifted from `swapper-landing-v2` so
the demo and the landing page read as one product: the same Inter Display /
JetBrains Mono pairing, the `#101114` / `#18191C` / `#242424` surfaces,
white-alpha over dark, `rounded-[20px]` cards, `.text-metallic` headings and
the masked 1px gradient ring.

## Structure

```
scripts/
  gen-xstocks.mjs               regenerates src/data/xstocks.ts
src/
  config.ts                     every widget option, in one place
  data/       xstocks.ts        43 xStocks on X Layer (generated)
              sources.ts        11 source chains, deposit options
              bridges.ts        CCIP + CCTP, and how the router chooses
  lib/        tokenPrices.ts    live USD prices for chain 196
              format.ts, cn.ts, useInView.ts
  wallet/     WalletContext.tsx EIP-6963 connect
              Eip1193Signer.ts  EIP-1193 → ethers-v5 shape for the widget
  swapper/    SwapperContext.tsx  preload + updateSigner + open + onEvent
  components/ RouteCard.tsx       the whole claim as one picture
              RouteSelection.tsx  quote both, execute the better one
              StockCard.tsx       one xStock tile, live price
              ConnectWallet.tsx   EIP-6963 picker
              DepositReceipt.tsx  transaction_success, rendered
              sections/         hero, catalogue, sources, routing, integrate, CTA
              ui/               Button, Section, Chip, SectionHeading, …
```

## Disclaimer

Demo only. Sector and 24h-change figures on this page are indicative
placeholders, not market data. xStocks are tokenized equity products issued
by third parties; nothing here is investment advice or an offer to sell.
