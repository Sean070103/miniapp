import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { coinbaseWallet, injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';

// Use a default project ID for development
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd9';

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
