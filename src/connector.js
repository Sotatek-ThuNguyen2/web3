import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
const WALLETCONNECT_BRIDGE_URL = "https://bridge.walletconnect.org";

const INFURA_KEY = "10df728faa6e46bea492bea63eaba945";
const NETWORK_URLS = {
  1: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  4: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  5: `https://goerli.infura.io/v3/${INFURA_KEY}`,
};

export const injected = new InjectedConnector({
  supportedChainIds: [1, 4, 5],
});

export const walletConnectConnector = new WalletConnectConnector({
  supportedChainIds: [1, 4, 5],
  rpc: NETWORK_URLS,
  bridge: WALLETCONNECT_BRIDGE_URL,
  qrcode: true,
});