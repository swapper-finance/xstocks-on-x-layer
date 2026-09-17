import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Eip1193Provider,
  Eip6963ProviderDetail,
  Eip6963ProviderInfo,
} from "./types";

/* The rdns of the wallet last connected, so a reload reconnects silently
   (eth_accounts, never eth_requestAccounts — the second one prompts). */
const LAST_WALLET_KEY = "swapper-xstocks:last-wallet";

type WalletContextValue = {
  /** Wallets that announced themselves via EIP-6963, plus any injected fallback */
  detected: Eip6963ProviderDetail[];
  address: string | null;
  chainId: number | null;
  wallet: Eip6963ProviderInfo | null;
  /* The connected provider itself, so the Swapper widget can be handed a
     signer over it and reuse this wallet rather than asking for its own.
     Changes identity on every connect/disconnect, which is what lets the
     effect that calls `updateSigner` know something moved. */
  provider: Eip1193Provider | null;
  connecting: boolean;
  error: string | null;
  connect: (detail: Eip6963ProviderDetail) => Promise<void>;
  disconnect: () => void;
  /** Ask the wallet to move to `chainId`; no-op if it is already there */
  switchChain: (chainId: number) => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

/* window.ethereum, dressed as a 6963 detail so the picker has one shape to
   render. Only used when no wallet announced itself — every current wallet
   does, but an older injected-only one would otherwise be invisible. */
const injectedFallback = (): Eip6963ProviderDetail[] => {
  const provider = window.ethereum;
  if (!provider) return [];
  return [
    {
      info: {
        uuid: "injected",
        name: provider.isMetaMask ? "MetaMask" : "Browser Wallet",
        icon: "",
        rdns: "injected",
      },
      provider,
    },
  ];
};

const readChainId = async (provider: Eip1193Provider) => {
  const hex = (await provider.request({ method: "eth_chainId" })) as string;
  return Number.parseInt(hex, 16);
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [announced, setAnnounced] = useState<Eip6963ProviderDetail[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [wallet, setWallet] = useState<Eip6963ProviderInfo | null>(null);
  const [provider, setProvider] = useState<Eip1193Provider | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* The provider currently connected. A ref, not state: the event handlers
     below need the live value and must not be torn down and re-registered
     every time an address changes. */
  const activeRef = useRef<Eip1193Provider | null>(null);

  /* Bumped by every disconnect. `adopt` awaits the chain id part-way
     through, and a disconnect landing inside that await used to be undone
     when adopt resumed and wrote its state anyway — the wallet came back on
     its own, and the rdns went back into localStorage so the next reload
     reconnected too. Adopt now captures this on entry and drops everything
     it was about to commit if it no longer matches. */
  const generation = useRef(0);

  /* EIP-6963 discovery. Wallets answer `requestProvider` by dispatching
     `announceProvider`, and late-loading ones announce unprompted — so the
     listener stays up for the life of the app rather than just long enough
     to collect one round. */
  useEffect(() => {
    const onAnnounce = (event: CustomEvent<Eip6963ProviderDetail>) => {
      setAnnounced((current) =>
        current.some((d) => d.info.uuid === event.detail.info.uuid)
          ? current
          : [...current, event.detail]
      );
    };

    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () =>
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
  }, []);

  const detected = useMemo(
    () => (announced.length ? announced : injectedFallback()),
    [announced]
  );

  const disconnect = useCallback(() => {
    generation.current += 1;
    activeRef.current = null;
    setProvider(null);
    setAddress(null);
    setChainId(null);
    setWallet(null);
    setError(null);
    try {
      localStorage.removeItem(LAST_WALLET_KEY);
    } catch {
      /* Private mode — the session just won't be restored on reload */
    }
  }, []);

  const adopt = useCallback(
    async (detail: Eip6963ProviderDetail, accounts: string[]) => {
      if (!accounts.length) {
        disconnect();
        return;
      }

      const seq = generation.current;
      /* Read before touching state, so a disconnect arriving during this
         await leaves nothing half-applied behind it. */
      const chain = await readChainId(detail.provider);
      if (seq !== generation.current) return;

      activeRef.current = detail.provider;
      setProvider(detail.provider);
      setAddress(accounts[0]);
      setChainId(chain);
      setWallet(detail.info);
      setError(null);
      try {
        localStorage.setItem(LAST_WALLET_KEY, detail.info.rdns);
      } catch {
        /* see above */
      }
    },
    [disconnect]
  );

  const connect = useCallback(
    async (detail: Eip6963ProviderDetail) => {
      setConnecting(true);
      setError(null);
      try {
        const accounts = (await detail.provider.request({
          method: "eth_requestAccounts",
        })) as string[];
        await adopt(detail, accounts);
      } catch (cause) {
        /* 4001 is the user closing the prompt, which is not a failure worth
           shouting about — everything else gets its message shown. */
        const code = (cause as { code?: number }).code;
        setError(
          code === 4001
            ? null
            : (cause as Error)?.message ?? "Could not connect to that wallet."
        );
      } finally {
        setConnecting(false);
      }
    },
    [adopt]
  );

  /* Silent reconnect: if a wallet we used before is present and still has
     the account authorised, pick it back up without a prompt. */
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current || !detected.length) return;

    let rdns: string | null = null;
    try {
      rdns = localStorage.getItem(LAST_WALLET_KEY);
    } catch {
      /* see above */
    }
    if (!rdns) return;

    const detail = detected.find((d) => d.info.rdns === rdns);
    if (!detail) return;

    restoredRef.current = true;
    void detail.provider
      .request({ method: "eth_accounts" })
      .then((accounts) => adopt(detail, accounts as string[]))
      .catch(() => {
        /* The wallet is locked or revoked the account — stay signed out */
      });
  }, [detected, adopt]);

  /* Account and chain changes. Bound to the connected provider only, and
     rebound whenever that changes. */
  useEffect(() => {
    const provider = activeRef.current;
    if (!provider?.on || !wallet) return;

    const onAccounts = (...args: never[]) => {
      const accounts = args[0] as unknown as string[];
      if (!accounts?.length) disconnect();
      else setAddress(accounts[0]);
    };
    const onChain = (...args: never[]) => {
      setChainId(Number.parseInt(args[0] as unknown as string, 16));
    };

    provider.on("accountsChanged", onAccounts);
    provider.on("chainChanged", onChain);
    return () => {
      provider.removeListener?.("accountsChanged", onAccounts);
      provider.removeListener?.("chainChanged", onChain);
    };
  }, [wallet, disconnect]);

  const switchChain = useCallback(
    async (target: number) => {
      const provider = activeRef.current;
      if (!provider || chainId === target) return;
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${target.toString(16)}` }],
      });
    },
    [chainId]
  );

  const value = useMemo(
    () => ({
      detected,
      address,
      chainId,
      wallet,
      provider,
      connecting,
      error,
      connect,
      disconnect,
      switchChain,
    }),
    [
      detected,
      address,
      chainId,
      wallet,
      provider,
      connecting,
      error,
      connect,
      disconnect,
      switchChain,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside <WalletProvider>");
  }
  return context;
};
