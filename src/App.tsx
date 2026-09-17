import DepositReceipt from "@/components/DepositReceipt";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import FrameRules from "@/components/ui/FrameRules";
import { XSTOCKS } from "@/data/xstocks";
import HomePage from "@/pages/HomePage";
import { SwapperProvider } from "@/swapper/SwapperContext";
import { WalletProvider } from "@/wallet/WalletContext";

/* Wallet outside Swapper: the deposit address the widget is opened with is
   the connected wallet, so the Swapper provider reads from the wallet one. */
const App = () => (
  <WalletProvider>
    <SwapperProvider stocks={XSTOCKS}>
      <div className="relative flex min-h-screen flex-col overflow-x-clip">
        <FrameRules />
        <Navbar />
        <main className="flex-1">
          <HomePage />
        </main>
        <Footer />
        <DepositReceipt />
      </div>
    </SwapperProvider>
  </WalletProvider>
);

export default App;
