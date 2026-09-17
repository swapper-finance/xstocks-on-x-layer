/* EIP-1193 + EIP-6963, typed by hand.

   No wallet library here on purpose: the demo needs an address and a chain,
   and the two standards that provide them are small enough to read in one
   sitting. Pulling in a connector kit would add a multi-megabyte dependency
   tree and a WalletConnect project id to an app whose whole point is that
   the *deposit* side needs neither. */

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: string, handler: (...args: never[]) => void): void;
  removeListener?(event: string, handler: (...args: never[]) => void): void;
}

/** EIP-6963: what a wallet announces about itself. */
export interface Eip6963ProviderInfo {
  uuid: string;
  name: string;
  /** data: URI, per the spec */
  icon: string;
  /** Reverse-DNS id, e.g. "com.okex.wallet" — stable across sessions */
  rdns: string;
}

export interface Eip6963ProviderDetail {
  info: Eip6963ProviderInfo;
  provider: Eip1193Provider;
}

export interface Eip6963AnnounceEvent extends CustomEvent {
  detail: Eip6963ProviderDetail;
}

declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": Eip6963AnnounceEvent;
  }

  interface Window {
    ethereum?: Eip1193Provider & { isMetaMask?: boolean };
  }
}

export type WalletState = {
  address: string | null;
  /** Decimal chain id, e.g. 1 */
  chainId: number | null;
  wallet: Eip6963ProviderInfo | null;
};
