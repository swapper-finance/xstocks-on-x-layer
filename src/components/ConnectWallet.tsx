import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import PulseDot from "@/components/ui/PulseDot";
import { cn } from "@/lib/cn";
import { shortenAddress } from "@/lib/format";
import { useWallet } from "@/wallet/WalletContext";

/* The masked 1px ring the landing page puts on floating plates. Longhands
   only — Tailwind emits the `mask` shorthand after `mask-composite` and
   would reset it to `add`. */
const PLATE_RING =
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:p-px after:[background:linear-gradient(to_top,rgba(255,255,255,0),rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.04))] after:[mask-image:linear-gradient(#000_0_0),linear-gradient(#000_0_0)] after:[mask-clip:content-box,border-box] after:[mask-composite:exclude]";

const ConnectWallet = () => {
  const { detected, address, wallet, connecting, error, connect, disconnect } =
    useWallet();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  /* Close on an outside click or Escape — the menu is a plate over the
     page, not a route, so it should never survive attention moving away. */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant={address ? "secondary" : "primary"}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={connecting}
      >
        {address ? (
          <>
            <PulseDot />
            <span className="tnum">{shortenAddress(address)}</span>
          </>
        ) : connecting ? (
          "Connecting…"
        ) : (
          "Connect Wallet"
        )}
      </Button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-[calc(100%+8px)] z-50 w-[264px] animate-m-up-sm overflow-hidden rounded-[20px] bg-lp-surface-container p-2",
            "shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]",
            PLATE_RING
          )}
        >
          {address ? (
            <>
              <div className="px-3 py-2.5">
                <p className="text-xxs font-semibold uppercase text-white/20">
                  Deposit wallet
                </p>
                <p className="tnum mt-1 break-all font-mono text-desc-xs text-white/80">
                  {address}
                </p>
                {wallet?.name && (
                  <p className="mt-1.5 text-desc-xs text-white/40">
                    via {wallet.name}
                  </p>
                )}
              </div>
              <div aria-hidden className="mx-3 my-1 h-px bg-white/5" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
                className="w-full rounded-[10px] px-3 py-2.5 text-left text-xs font-medium text-white/60 transition-colors duration-150 hover:bg-white/[0.05] hover:text-white"
              >
                Disconnect
              </button>
            </>
          ) : detected.length ? (
            <>
              <p className="px-3 pb-1 pt-2 text-xxs font-semibold uppercase text-white/20">
                Choose a wallet
              </p>
              {detected.map((detail) => (
                <button
                  key={detail.info.uuid}
                  type="button"
                  role="menuitem"
                  aria-label={`Connect ${detail.info.name}`}
                  onClick={async () => {
                    await connect(detail);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors duration-150 hover:bg-white/[0.05]"
                >
                  {detail.info.icon ? (
                    <img
                      src={detail.info.icon}
                      alt=""
                      className="h-6 w-6 shrink-0 rounded-md"
                    />
                  ) : (
                    <span className="h-6 w-6 shrink-0 rounded-md bg-white/[0.05]" />
                  )}
                  <span className="text-xs font-medium text-white">
                    {detail.info.name}
                  </span>
                </button>
              ))}
            </>
          ) : (
            <p className="px-3 py-4 text-desc-xs text-white/40">
              No browser wallet detected. Install MetaMask, OKX Wallet, Rabby
              or another EIP-6963 wallet and reload.
            </p>
          )}

          {error && (
            <p className="px-3 pb-2 pt-1 text-desc-xs text-[#f44336]">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
