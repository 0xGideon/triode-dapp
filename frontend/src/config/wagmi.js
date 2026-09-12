import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { robinhoodMainnet, robinhoodTestnet } from "./chains.js";

export const wagmiConfig = createConfig({
  chains: [robinhoodMainnet, robinhoodTestnet],
  connectors: [injected()],
  transports: {
    [robinhoodMainnet.id]: http(),
    [robinhoodTestnet.id]: http(),
  },
});
