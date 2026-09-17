import chainlink from "@/assets/icons/chainlink.svg";
import circle from "@/assets/icons/circle.svg";

/* The two transports Swapper routes a cross-chain deposit over. Both are
   quoted for every deposit; the better quote is the one that gets executed.
   Only ever one transfer — the route that loses the comparison is never
   started. */

export type BridgeId = "ccip" | "cctp";

export type Bridge = {
  id: BridgeId;
  name: string;
  /** The operator, for the small print under the name */
  operator: string;
  icon: string;
  tagline: string;
  /** What this transport is good at, in the router's terms */
  strengths: string[];
  /** What it can carry — the honest limit on each */
  carries: string;
  /** Tailwind colour class for this lane's packet and settled state */
  tone: string;
  /** Hex, for the SVG stroke on this lane */
  hex: string;
};

export const BRIDGES: Bridge[] = [
  {
    id: "ccip",
    name: "Chainlink CCIP",
    operator: "Chainlink",
    icon: chainlink,
    tagline: "The general lane",
    strengths: [
      "Any token, any supported lane",
      "Risk Management Network watches every message",
      "Programmable token transfers — value and instructions together",
    ],
    carries: "Any supported token",
    tone: "bg-accent-route",
    hex: "#8466FF",
  },
  {
    id: "cctp",
    name: "Circle CCTP",
    operator: "Circle",
    icon: circle,
    tagline: "The USDC express lane",
    strengths: [
      "Native burn-and-mint — no wrapped intermediate",
      "Canonical USDC on both sides, 1:1",
      "Often the cheapest hop when the leg is already in USDC",
    ],
    carries: "Native USDC only",
    tone: "bg-accent-settled",
    hex: "#1FCF9B",
  },
];

export const byId = (id: BridgeId) =>
  BRIDGES.find((bridge) => bridge.id === id) as Bridge;

/* What the router does on every deposit, in order. The comparison is the
   point — the execution is whatever the comparison chose. */
export const ROUTING_STEPS = [
  {
    title: "Ask both",
    body: "Swapper requests a quote for the same leg from CCIP and from CCTP at the same time.",
  },
  {
    title: "Drop what can't carry it",
    body: "CCTP moves native USDC and nothing else. If the leg isn't USDC, CCIP takes it uncontested.",
  },
  {
    title: "Compare what comes back",
    body: "Fees, expected finality, and what actually lands on the other side. Neither route is the default — the quotes decide.",
  },
  {
    title: "Execute the better one",
    body: "One route is chosen and one transfer is sent. The route that lost the comparison is never started.",
  },
];
