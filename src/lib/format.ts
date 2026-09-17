/* 0x1234…cdef — the shortening every wallet UI uses, so an address stays
   recognisable at chip width. */
export const shortenAddress = (address: string, lead = 6, tail = 4) =>
  address.length <= lead + tail + 1
    ? address
    : `${address.slice(0, lead)}…${address.slice(-tail)}`;

export const formatUsd = (value: number, fractionDigits = 2) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

/* Signed and always two decimals, because the figure sits next to an arrow
   whose direction has to agree with it. */
export const formatPercent = (value: number) =>
  `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}%`;

export const formatCompactUsd = (value: number) =>
  `$${value.toLocaleString("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  })}`;
