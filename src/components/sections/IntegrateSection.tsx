import { useState } from "react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { DST_CHAIN_ID, INTEGRATOR_ID } from "@/config";
import { cn } from "@/lib/cn";
import { useInView } from "@/lib/useInView";
import { useSwapper } from "@/swapper/SwapperContext";
import { useWallet } from "@/wallet/WalletContext";

const PLATE_RING =
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:p-px after:[background:linear-gradient(to_top,rgba(255,255,255,0),rgba(255,255,255,0.01)_50%,rgba(255,255,255,0.02))] after:[mask-image:linear-gradient(#000_0_0),linear-gradient(#000_0_0)] after:[mask-clip:content-box,border-box] after:[mask-composite:exclude]";

/* A token in the snippet. `live` marks the values this page is actually
   running with right now — connect a wallet and the address below changes,
   pick another xStock and so does the token. */
const Line = ({
  indent = 0,
  children,
}: {
  indent?: number;
  children: React.ReactNode;
}) => (
  <div style={{ paddingLeft: `${indent * 16}px` }} className="whitespace-pre">
    {children}
  </div>
);

const Key = ({ children }: { children: React.ReactNode }) => (
  <span className="text-white/60">{children}</span>
);

const Str = ({ live, children }: { live?: boolean; children: React.ReactNode }) => (
  <span className={live ? "text-accent-settled" : "text-accent-route"}>
    "{children}"
  </span>
);

const Comment = ({ children }: { children: React.ReactNode }) => (
  <span className="text-white/20">{children}</span>
);

const IntegrateSection = () => {
  const { selected } = useSwapper();
  const { address } = useWallet();
  const [copied, setCopied] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>(0.2);

  const depositWalletAddress = address ?? "<connected wallet>";
  const dstTokenAddr = selected?.address ?? "<xStock address>";

  const snippet = `import { preloadSwapperModal } from "@swapper-finance/deposit-sdk";

// On mount — builds the modal hidden and loads the widget in the
// background, so the first open() is instant.
const modal = preloadSwapperModal({
  integratorId: "${INTEGRATOR_ID}",
  dstChainId: "${DST_CHAIN_ID}",
  dstTokenAddr: "${dstTokenAddr}",
  depositWalletAddress: "${depositWalletAddress}",
  styles: { themeMode: "dark" },
});

// On connect — the widget reuses this wallet instead of asking
// for one of its own.
modal.updateSigner(signer);

// On click — the patch is applied to the live widget right before
// it becomes visible.
modal.open({
  dstTokenAddr: "${dstTokenAddr}",
  depositWalletAddress: "${depositWalletAddress}",
});`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Clipboard denied — the snippet is selectable, so nothing is lost */
    }
  };

  return (
    <Section id="integrate">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col">
          <SectionHeading
            eyebrow="Integrate"
            title="Twelve lines, and the deposit problem is gone."
            description="No provider to wrap, no CSS to import, no wallet kit required. The SDK is framework-agnostic DOM code with zero runtime dependencies."
          />

          <dl className="mt-10 flex flex-col gap-6">
            {[
              [
                "preloadSwapperModal",
                "Builds hidden and loads the widget up front. Smart-wallet authorization stays deferred until the first open, so visitors who never buy never get one.",
              ],
              [
                "open(patch)",
                "Takes a config patch — the destination token and deposit wallet this page changes as the visitor picks and connects.",
              ],
              [
                "updateSigner(signer)",
                "Hands the widget the wallet this page already connected, so the visitor isn't asked for one twice. Pass null on disconnect.",
              ],
              [
                "onEvent",
                "transaction_success carries the hash, the explorer URL, the token and the amount received. The receipt strip on this page is that event.",
              ],
            ].map(([term, body]) => (
              <div key={term} className="flex flex-col gap-1.5">
                <dt className="font-mono text-mono-xxs text-white/80">{term}</dt>
                <dd className="text-desc-xs text-white/40">{body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          ref={ref}
          className={cn(
            "relative overflow-hidden rounded-[20px] bg-[#1d1d20]",
            PLATE_RING,
            inView ? "animate-card-rise" : "opacity-0"
          )}
        >
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
            <span className="font-mono text-mono-xxs text-white/40">
              SwapperContext.tsx
            </span>
            <button
              type="button"
              onClick={copy}
              className="rounded-[96px] bg-white/[0.03] px-2.5 py-1 text-micro-xxs font-medium text-white/60 transition-colors duration-150 hover:bg-white/[0.08] hover:text-white"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <pre className="no-scrollbar overflow-x-auto p-5 font-mono text-desc-xs leading-[22px] text-white/80">
            <code>
              <Line>
                <Key>import</Key> {"{ preloadSwapperModal } "}
                <Key>from</Key> <Str>@swapper-finance/deposit-sdk</Str>;
              </Line>
              <Line>{" "}</Line>
              <Line>
                <Comment>// On mount — hidden build + background load,</Comment>
              </Line>
              <Line>
                <Comment>// so the first open() is instant.</Comment>
              </Line>
              <Line>
                <Key>const</Key> modal = preloadSwapperModal({"{"}
              </Line>
              <Line indent={1}>
                integratorId: <Str>{INTEGRATOR_ID}</Str>,
              </Line>
              <Line indent={1}>
                dstChainId: <Str>{DST_CHAIN_ID}</Str>,
              </Line>
              <Line indent={1}>
                dstTokenAddr: <Str live>{dstTokenAddr}</Str>,
              </Line>
              <Line indent={1}>
                depositWalletAddress: <Str live>{depositWalletAddress}</Str>,
              </Line>
              <Line indent={1}>
                styles: {"{ themeMode: "}
                <Str>dark</Str>
                {" }"},
              </Line>
              <Line>{"});"}</Line>
              <Line>{" "}</Line>
              <Line>
                <Comment>// On connect — the widget reuses this wallet.</Comment>
              </Line>
              <Line>modal.updateSigner(signer);</Line>
              <Line>{" "}</Line>
              <Line>
                <Comment>// On click — patched into the live widget.</Comment>
              </Line>
              <Line>modal.open({"{"}</Line>
              <Line indent={1}>
                dstTokenAddr: <Str live>{dstTokenAddr}</Str>,
              </Line>
              <Line indent={1}>
                depositWalletAddress: <Str live>{depositWalletAddress}</Str>,
              </Line>
              <Line>{"});"}</Line>
            </code>
          </pre>

          <div className="flex items-center gap-2 border-t border-white/5 px-5 py-3">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-settled" />
            <p className="text-desc-xxs text-white/40">
              Green values are live — they change as you connect a wallet and
              pick an xStock above.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default IntegrateSection;
