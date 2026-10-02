import {
  preloadSwapperModal,
  WidgetEventName,
  type SwapperModal,
  type TransactionSuccessPayload,
} from "@swapper-finance/deposit-sdk";
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
import {
  DEFAULT_TOKEN_ADDRESS,
  DST_CHAIN_ID,
  INTEGRATOR_ID,
  MODAL_STYLE,
  WIDGET_STYLES,
} from "@/config";
import type { XStock } from "@/data/xstocks";
import { Eip1193Signer } from "@/wallet/Eip1193Signer";
import { useWallet } from "@/wallet/WalletContext";

type SwapperContextValue = {
  /** The widget has finished loading in the background and open() is instant */
  ready: boolean;
  /** The xStock the modal will be opened for */
  selected: XStock | null;
  select: (stock: XStock) => void;
  /** Open the preloaded widget, patching in the current wallet and token */
  buy: (stock: XStock) => void;
  /** The last completed deposit, for the receipt strip */
  lastDeposit: (TransactionSuccessPayload & { stock: XStock | null }) | null;
  dismissDeposit: () => void;
};

const SwapperContext = createContext<SwapperContextValue | null>(null);

export const SwapperProvider = ({
  children,
  stocks,
}: {
  children: ReactNode;
  stocks: XStock[];
}) => {
  const { address, provider } = useWallet();
  const modalRef = useRef<SwapperModal | null>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<XStock | null>(
    stocks.find((s) => s.address === DEFAULT_TOKEN_ADDRESS) ?? stocks[0] ?? null
  );
  const [lastDeposit, setLastDeposit] = useState<
    (TransactionSuccessPayload & { stock: XStock | null }) | null
  >(null);

  /* The widget is opened from a click handler that was created long before
     the visitor connected a wallet, so the address is read through a ref at
     open() time rather than captured in the closure. Same for the stock
     list, which the success handler needs to name the token that landed. */
  const addressRef = useRef(address);
  addressRef.current = address;
  const stocksRef = useRef(stocks);
  stocksRef.current = stocks;

  /* Preload only once a wallet is connected, against that wallet: the
     modal is built hidden and the widget loads its bundle, chains and token
     list in the background, so the first open() is instant instead of a
     blank iframe the visitor watches boot. Waiting for the wallet means the
     widget is never configured with anything but the visitor's own address
     as the deposit destination — no placeholder, never the zero address.

     Keyed on the address, so switching accounts rebuilds the widget for the
     new one and disconnecting tears it down. Smart-wallet authorization
     stays deferred until the first open, so a visitor who never buys never
     gets one. */
  useEffect(() => {
    if (!address) return;

    const modal = preloadSwapperModal({
      integratorId: INTEGRATOR_ID,
      dstChainId: DST_CHAIN_ID,
      dstTokenAddr: DEFAULT_TOKEN_ADDRESS,
      depositWalletAddress: address,
      actionLabel: "buy",
      styles: WIDGET_STYLES,
      modalStyle: MODAL_STYLE,
      onEvent: (event) => {
        if (event.type !== WidgetEventName.TRANSACTION_SUCCESS) return;
        const payload = event.data as TransactionSuccessPayload;
        setLastDeposit({
          ...payload,
          stock:
            stocksRef.current.find(
              (s) =>
                s.address.toLowerCase() === payload.tokenAddress?.toLowerCase()
            ) ?? null,
        });
      },
    });

    modalRef.current = modal;
    setReady(true);

    return () => {
      modal.destroy();
      modalRef.current = null;
      setReady(false);
    };
  }, [address]);

  /* Hand the page's wallet to the widget, so a visitor who already connected
     up top is not asked to connect a second time inside the modal — the
     widget skips its own connect step and sends transaction and chain-switch
     requests back through this signer.

     `updateSigner` rather than `updateConfig({ wallet })`: the wallet bridge
     is a live postMessage channel set up when the signer is installed, and a
     plain config merge would send the option across without ever opening it.
     It is also safe to call before the modal has finished building, and
     `null` tears the bridge back down on disconnect. */
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    modal.updateSigner(
      provider && address ? new Eip1193Signer(provider, address) : null
    );
  }, [provider, address, ready]);

  const select = useCallback((stock: XStock) => setSelected(stock), []);

  const buy = useCallback((stock: XStock) => {
    const modal = modalRef.current;
    const depositWalletAddress = addressRef.current;
    if (!modal || !depositWalletAddress) return;

    setSelected(stock);
    /* The destination token may have changed since the preload, so it rides
       in as a config patch — applied to the live widget right before it
       becomes visible. The deposit wallet is re-sent as the connected
       address so the widget can only ever open on the visitor's own. */
    modal.open({
      dstTokenAddr: stock.address,
      depositWalletAddress,
    });
  }, []);

  const dismissDeposit = useCallback(() => setLastDeposit(null), []);

  const value = useMemo(
    () => ({ ready, selected, select, buy, lastDeposit, dismissDeposit }),
    [ready, selected, select, buy, lastDeposit, dismissDeposit]
  );

  return (
    <SwapperContext.Provider value={value}>{children}</SwapperContext.Provider>
  );
};

export const useSwapper = () => {
  const context = useContext(SwapperContext);
  if (!context) {
    throw new Error("useSwapper must be used inside <SwapperProvider>");
  }
  return context;
};
