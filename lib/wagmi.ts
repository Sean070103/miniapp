import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { coinbaseWallet, injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';

const projectId = 'YOUR_PROJECT_ID'; // TODO: Replace with your WalletConnect Cloud project ID

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        coinbaseWallet,
        injectedWallet,
      ],
    },
  ],
  { appName: 'DailyBase', projectId }
);

export const config = createConfig({
  chains: [base],
  connectors,
  transports: {
    [base.id]: http(),
  },
});
