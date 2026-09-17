import { CHAIN_EXPLORER } from "@/config";
import { depositMethodLabel } from "@/data/sources";
import { cn } from "@/lib/cn";
import { useSwapper } from "@/swapper/SwapperContext";

const PLATE_RING =
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:p-px after:[background:linear-gradient(to_top,rgba(255,255,255,0),rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.04))] after:[mask-image:linear-gradient(#000_0_0),linear-gradient(#000_0_0)] after:[mask-clip:content-box,border-box] after:[mask-composite:exclude]";

/* The widget's own `transaction_success` event, rendered. Proof the
   integration is two-way: the page knows a deposit landed without polling
   anything. */
const DepositReceipt = () => {
  const { lastDeposit, dismissDeposit } = useSwapper();
  if (!lastDeposit) return null;

  const explorerUrl =
    lastDeposit.explorerUrl ??
    (lastDeposit.txHash ? `${CHAIN_EXPLORER}/tx/${lastDeposit.txHash}` : null);

  const symbol =
    lastDeposit.stock?.symbol ?? lastDeposit.tokenSymbol ?? "your xStock";

  const methodLabel = depositMethodLabel(lastDeposit.depositOption);

  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-5 left-1/2 z-[90] w-[calc(100%-40px)] max-w-[420px] -translate-x-1/2 animate-m-rise overflow-hidden rounded-[20px] bg-lp-surface-container p-5",
        "shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]",
        PLATE_RING
      )}
    >
      <div className="flex items-start gap-3">
        {lastDeposit.stock ? (
          <img
            src={lastDeposit.stock.image}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full bg-lp-surface-alt"
          />
        ) : (
          <span className="h-9 w-9 shrink-0 rounded-full bg-accent-settled/15" />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-white">
            {symbol} settled
          </p>
          <p className="mt-0.5 text-desc-xs text-white/40">
            {lastDeposit.amountReceived
              ? `${lastDeposit.amountReceived} received`
              : "Deposit confirmed"}
            {methodLabel && ` · ${methodLabel}`}
          </p>

          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 inline-block text-desc-xs font-medium text-accent-settled transition-opacity duration-150 hover:opacity-80"
            >
              View transaction →
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={dismissDeposit}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-white/40 transition-colors duration-150 hover:bg-white/[0.05] hover:text-white"
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DepositReceipt;
