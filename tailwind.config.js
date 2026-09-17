/* Design tokens — lifted from swapper-landing-v2 so this demo and the
   landing page render as one product. Colours are the four LP/* variables;
   the type scale is the LP/Display, LP/Text, LP/Description, LP/Micro and
   LP/Mono styles, with Figma's letterSpacing percentages written in em.

   Only the keyframes this demo actually uses are carried over — the landing
   page's full Motion Set is a mock widget assembling itself, which this app
   doesn't draw (it opens the real widget instead). */

const screens = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export default {
  content: ["./index.html", "./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    screens,
    extend: {
      fontFamily: {
        sans: ["Inter Display", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        lp: {
          text: "#FFFFFF",
          "surface-base": "#101114",
          "surface-container": "#18191C",
          "surface-alt": "#242424",
        },
        /* The two accents the landing page's SDK stage animates between:
           purple is a route in flight, green is a route settled. This demo
           reads them the same way — pending vs. confirmed. */
        accent: {
          route: "#8466FF",
          settled: "#1FCF9B",
        },
      },
      fontSize: {
        "display-lg": [
          "64px",
          { lineHeight: "72px", letterSpacing: "-0.005em" },
        ], // 64/72 · -0.5%
        "display-md": ["40px", { lineHeight: "48px", letterSpacing: "0em" }], // 40/48 · 0%
        "display-sm": ["32px", { lineHeight: "40px", letterSpacing: "0em" }], // 32/40 · 0%

        xl: ["24px", { lineHeight: "32px", letterSpacing: "0em" }], // 24/32 · 0%
        lg: ["18px", { lineHeight: "26px", letterSpacing: "0em" }], // 18/26 · 0%
        md: ["16px", { lineHeight: "24px", letterSpacing: "0.01em" }], // 16/24 · 1%
        sm: ["14px", { lineHeight: "24px", letterSpacing: "0.01em" }], // 14/24 · 1%
        xs: ["12px", { lineHeight: "20px", letterSpacing: "0.01em" }], // 12/20 · 1%
        xxs: ["10px", { lineHeight: "20px", letterSpacing: "0.02em" }], // 10/20 · 2%
        tiny: ["8px", { lineHeight: "12px", letterSpacing: "0.01em" }], // 8/12 · 1%

        "desc-sm": ["14px", { lineHeight: "20px", letterSpacing: "0em" }], // 14/20 · 0%
        "desc-xs": ["12px", { lineHeight: "18px", letterSpacing: "0em" }], // 12/18 · 0%
        "desc-xxs": ["10px", { lineHeight: "14px", letterSpacing: "0.005em" }], // 10/14 · 0.5%

        "micro-xxs": ["10px", { lineHeight: "15px", letterSpacing: "0.01em" }], // 10/15 · 1%

        "mono-xxs": ["10px", { lineHeight: "13px", letterSpacing: "0em" }], // 10/13 · 0%
      },
      maxWidth: {
        /* Nav/section container on the 1440 frame */
        content: "1216px",
      },
      keyframes: {
        /* Two identical copies of the strip each slide their own full width,
           so the loop never shows a gap. */
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },

        /* Section entrance — played once, when the section scrolls into
           view. Cards in a row start 120ms apart. */
        "card-rise": {
          from: { opacity: "0", transform: "translateY(20px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },

        /* The Motion Set entrances the demo reuses: a block rising into
           place, a row lifting inside it, a plain fade. `both` at the
           animation keeps each element at its opening keyframe through its
           delay and parked once it lands. */
        "m-rise": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "m-tile": {
          from: { opacity: "0", transform: "translateY(10px) scale(0.96)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "m-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "m-up-sm": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "m-left": {
          from: { opacity: "0", transform: "translateX(8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "m-fade": { from: { opacity: "0" }, to: { opacity: "1" } },
        "m-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },

        /* The CCIP route: a dash pattern walking along the path, so the
           line reads as a message in flight rather than a drawn edge. */
        "route-dash": {
          from: { strokeDashoffset: "24" },
          to: { strokeDashoffset: "0" },
        },
        /* …and the packet riding it, which fades in at the source, crosses,
           and clears at the destination on one 3s loop.

           `left` in percent rather than a transform: a percentage transform
           resolves against the 6px dot itself, and an `offset-path` needs
           the path written in px, which only lines up with the track at one
           container width. Percentage `left` resolves against the track,
           so the packet lands on the destination at every breakpoint. */
        "route-packet": {
          "0%": { left: "0%", opacity: "0" },
          "8%": { opacity: "1" },
          "88%": { opacity: "1" },
          "100%": { left: "100%", opacity: "0" },
        },

        /* A value that hasn't come back yet, breathing while it is waited
           on — the quote placeholders in the route-selection card. */
        "m-dim": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },

        /* A packet crossing the chosen route's lane, and the trail it
           leaves behind it. Written as animations rather than transitions
           because each round has to restart them from zero at a duration
           that changes per round — a transition restarted by rewriting
           `left` and `transition-duration` in the same style flush is not
           reliably re-run, and the lane ends up showing the previous
           round's position. Mounted with a key per round, these always
           start clean. */
        "lane-run": {
          from: { left: "0%" },
          to: { left: "100%" },
        },
        "lane-fill": {
          from: { width: "0%" },
          to: { width: "100%" },
        },

        /* A dot announcing something is live: the default ping scaled to
           1.625 so an 8px dot tops out as a 13px ring rather than 16px. */
        "m-ping-sm": {
          "75%, 100%": { transform: "scale(1.625)", opacity: "0" },
        },
        /* The price ticker's own beat — a value that just changed flashes
           its colour and settles back to the resting white. */
        "tick-flash": {
          "0%": { opacity: "0.35" },
          "30%": { opacity: "1" },
          "100%": { opacity: "0.6" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "card-rise": "card-rise 700ms cubic-bezier(0.25, 1, 0.5, 1) both",

        "m-rise": "m-rise 300ms cubic-bezier(0, 0, 0.58, 1) both",
        "m-tile": "m-tile 250ms cubic-bezier(0.18, 1, 0.32, 1.15) both",
        "m-up": "m-up 200ms cubic-bezier(0, 0, 0.58, 1) both",
        "m-up-sm": "m-up-sm 200ms cubic-bezier(0, 0, 0.58, 1) both",
        "m-left": "m-left 250ms cubic-bezier(0, 0, 0.58, 1) both",
        "m-fade": "m-fade 200ms cubic-bezier(0, 0, 0.58, 1) both",
        "m-spin": "m-spin 800ms linear infinite",

        "route-dash": "route-dash 1.2s linear infinite",
        "route-packet": "route-packet 3s cubic-bezier(0.45, 0, 0.55, 1) infinite",

        "m-ping-sm": "m-ping-sm 1s cubic-bezier(0, 0, 0.2, 1) infinite",
        "m-dim": "m-dim 1.4s linear infinite",
        "tick-flash": "tick-flash 600ms ease-out both",
        /* Duration is set per lane at the call site — it is the quote */
        "lane-run": "lane-run 1ms linear forwards",
        "lane-fill": "lane-fill 1ms linear forwards",
      },
    },
  },
  plugins: [],
};
