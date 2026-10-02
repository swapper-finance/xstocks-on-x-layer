import xlayer from "@/assets/icons/xlayer.jpg";

/* Everything the deposit widget is configured with, in one place.

   The pitch this demo makes is X Layer: xStocks bought on X Layer, funded
   from any chain, with the cross-chain leg carried by Chainlink CCIP. The
   xStocks are live on X Layer now, so the widget is pointed straight at
   chain 196 — the demo and the pitch are the same lane. */

/** Destination chain the deposit settles on — X Layer. */
export const DST_CHAIN_ID = "196";

/** The destination, as the copy names it. */
export const TARGET_CHAIN = {
  chainId: "196",
  name: "X Layer",
  icon: xlayer,
};

export const INTEGRATOR_ID = "caf78ffbf6270857cbc9";

/** The xStock the page opens on — NVIDIA, on X Layer. */
export const DEFAULT_TOKEN_ADDRESS =
  "0xa8ddb5cd96b5222afe198316e9a57caa642850d5";

/** Matches the landing page's palette, so the widget doesn't read as a
    third-party panel dropped on top of the page. */
export const WIDGET_STYLES = {
  themeMode: "dark" as const,
  componentStyles: {
    primaryColor: "#E5E5E6",
    primaryButtonTextColor: "#101114",
    accentColor: "#8466FF",
    sphereColor: "#8466FF",
    backgroundColor: "#101114",
    surfaceColor: "#18191C",
    surfaceAltColor: "#242424",
    successColor: "#1FCF9B",
    textColor: "#FFFFFF",
    borderRadius: "12px",
  },
};

/* Dynamic height is not an option to switch on — `SwapperModal` always
   builds its iframe with `flexibleHeight: true` and listens for the widget's
   `resize` event, animating the container to whatever the current screen
   needs (clamped to 90vh). The `height` below is therefore only the height
   the modal opens at, before the first resize message lands.

   It is set close to the home screen's real height on purpose: leaving the
   SDK default of 560px makes the first open visibly settle from 560 down to
   the home screen's size, and the point of preloading is that the first open
   looks finished. */
export const MODAL_STYLE = {
  overlayColor: "rgba(16, 17, 20, 0.82)",
  borderRadius: "20px",
  width: "440px",
  height: "312px",
  zIndex: 100,
};

export const CHAIN_EXPLORER = "https://www.oklink.com/xlayer";
