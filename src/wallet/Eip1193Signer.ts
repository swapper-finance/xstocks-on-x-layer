import type { Eip1193Provider } from "./types";

/* Any numeric form the widget or an adapter may hand over — decimal string,
   0x-hex string, number, bigint, or an ethers BigNumber (via toString) — as
   the minimal 0x-hex quantity JSON-RPC expects. Empty values become
   undefined so the field is dropped rather than sent as zero. */
const toQuantity = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const big =
    typeof value === "bigint"
      ? value
      : BigInt(typeof value === "number" ? Math.trunc(value) : String(value));
  return `0x${big.toString(16)}`;
};

/* Bridges the EIP-1193 provider this app connects to into something the
   Swapper SDK can drive, so the widget reuses the wallet already connected
   on the page instead of asking for one of its own.

   It is deliberately shaped as an **ethers v5 signer**, not as the SDK's own
   `SwapperSigner`. `createSwapperSigner` duck-types in a fixed order and
   `isEthersV5Signer` — getAddress + getChainId + sendTransaction, and no
   `getAddresses` — matches before `isSwapperSigner` is ever reached. A plain
   SwapperSigner-shaped object therefore lands in `EthersV5SignerAdapter`
   anyway, and that adapter reaches for `provider.send()` to switch chains.
   Meeting the v5 contract properly is the honest way to satisfy it: every
   method below maps onto exactly one JSON-RPC call.

   `provider.send(method, params)` is the whole trick — an EIP-1193
   `request({ method, params })` is the same call with a different spelling. */
export class Eip1193Signer {
  /* EthersV5SignerAdapter.switchChain() and the SDK's wallet-name detection
     both go through this. */
  readonly provider: {
    send(method: string, params: unknown[]): Promise<unknown>;
  };

  constructor(
    private readonly eip1193: Eip1193Provider,
    /* The address the page is showing. Used as the `from` on transactions so
       the widget can never spend out of an account the UI isn't naming. */
    private readonly address: string
  ) {
    this.provider = {
      send: (method, params) => this.eip1193.request({ method, params }),
    };
  }

  async getAddress(): Promise<string> {
    return this.address;
  }

  async getChainId(): Promise<number> {
    const hex = (await this.eip1193.request({ method: "eth_chainId" })) as string;
    return Number.parseInt(hex, 16);
  }

  async sendTransaction(tx: Record<string, unknown>): Promise<{ hash: string }> {
    /* eth_sendTransaction answers with the hash itself; the v5 adapter reads
       `.hash` off whatever comes back, so it is wrapped here. Undefined
       fields are dropped — some wallets reject an explicit `value: undefined`.

       The widget sends `value` and `gasLimit` as decimal wei strings (what
       an ethers signer or viem would parse), but JSON-RPC quantities are hex:
       passed through raw, a wallet reads "1000000000000000" as
       0x1000000000000000 and signs a wildly different amount and gas limit.
       So both are normalized to 0x-prefixed hex quantities here. */
    const params = Object.fromEntries(
      Object.entries({
        from: this.address,
        to: tx.to,
        data: tx.data,
        value: toQuantity(tx.value),
        gas: toQuantity(tx.gasLimit),
      }).filter(([, value]) => value !== undefined)
    );

    const hash = (await this.eip1193.request({
      method: "eth_sendTransaction",
      params: [params],
    })) as string;

    return { hash };
  }

  /* Present so the SDK advertises signing capability to the widget — the
     deposit-from-Polymarket and deposit-from-perps flows authorize with a
     signature rather than a transaction.

     The v5 adapter hands a Uint8Array when the widget asked for a raw digest
     (`isHex`) and a plain string otherwise, so both are handled: a digest is
     put back into hex for `personal_sign`, which is what recovers the right
     address; a string is sent as UTF-8 hex. */
  async signMessage(message: string | Uint8Array): Promise<string> {
    const hex =
      typeof message === "string"
        ? `0x${Array.from(new TextEncoder().encode(message))
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("")}`
        : `0x${Array.from(message)
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("")}`;

    return (await this.eip1193.request({
      method: "personal_sign",
      params: [hex, this.address],
    })) as string;
  }

  /* The v5 name. The adapter has already stripped EIP712Domain from `types`,
     which is what ethers itself expects — but eth_signTypedData_v4 wants it
     back, so it is restored here before the payload goes to the wallet. */
  async _signTypedData(
    domain: Record<string, unknown>,
    types: Record<string, { name: string; type: string }[]>,
    value: Record<string, unknown>
  ): Promise<string> {
    const primaryType = Object.keys(types)[0];

    const domainFields = [
      ["name", "string"],
      ["version", "string"],
      ["chainId", "uint256"],
      ["verifyingContract", "address"],
      ["salt", "bytes32"],
    ] as const;

    const payload = {
      domain,
      primaryType,
      types: {
        EIP712Domain: domainFields
          .filter(([field]) => domain[field] !== undefined)
          .map(([name, type]) => ({ name, type })),
        ...types,
      },
      message: value,
    };

    return (await this.eip1193.request({
      method: "eth_signTypedData_v4",
      params: [this.address, JSON.stringify(payload)],
    })) as string;
  }
}
