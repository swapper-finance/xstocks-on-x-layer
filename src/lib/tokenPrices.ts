import { useEffect, useState } from "react";
import { DST_CHAIN_ID } from "@/config";

/* Live USD prices, from the same feed the deposit widget prices against.

   The grid used to render indicative figures baked into src/data/xstocks.ts.
   They drifted — by launch day 26 of the 43 were more than 20% off, and one
   was 2.6x out — so the tiles now read this instead and the data file no
   longer carries a price at all. */

const ENDPOINT = "https://swapper.finance/api/tokenPrices";

/** Lowercased token address -> USD price. */
export type PriceMap = Record<string, number>;

export type PriceStatus = "loading" | "ready" | "error";

/* The endpoint takes its filter as one JSON blob in a `data` query param and
   answers `{ "<chainId>": { "<address>": "<usd as a string>" } }`. It sends
   `access-control-allow-origin` back reflecting the caller, so the browser
   can read it straight from the page — no dev proxy in front of it. */
export const fetchTokenPrices = async (
  chainId: string,
  signal?: AbortSignal
): Promise<PriceMap> => {
  const query = encodeURIComponent(JSON.stringify({ chainId: [chainId] }));
  const response = await fetch(`${ENDPOINT}?data=${query}`, {
    signal,
    headers: { accept: "*/*" },
  });
  if (!response.ok) throw new Error(`tokenPrices responded ${response.status}`);

  const body = (await response.json()) as Record<
    string,
    Record<string, string> | undefined
  >;

  const prices: PriceMap = {};
  for (const [address, value] of Object.entries(body[chainId] ?? {})) {
    const usd = Number(value);
    /* A token the feed has no source for comes back missing, and the grid
       has to tell that apart from a real price — so anything unparseable or
       non-positive is dropped rather than rendered as a $0.00 stock. */
    if (Number.isFinite(usd) && usd > 0) prices[address.toLowerCase()] = usd;
  }
  return prices;
};

/** How often the grid re-reads the feed while the page is open. */
const REFRESH_MS = 60_000;

export const useTokenPrices = (chainId: string = DST_CHAIN_ID) => {
  const [prices, setPrices] = useState<PriceMap>({});
  const [status, setStatus] = useState<PriceStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();
    let timer = 0;

    const load = async () => {
      try {
        setPrices(await fetchTokenPrices(chainId, controller.signal));
        setStatus("ready");
      } catch {
        /* A failed refresh keeps whatever is already on screen — only a
           first load that never landed leaves the tiles with no price. */
        setStatus((current) => (current === "ready" ? current : "error"));
      } finally {
        if (!controller.signal.aborted) {
          timer = window.setTimeout(load, REFRESH_MS);
        }
      }
    };

    void load();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [chainId]);

  return { prices, status };
};
