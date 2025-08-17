import { connectorsForWallets, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';

// Use a default project ID for development
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd9';

// Use getDefaultWallets for the latest RainbowKit setup
const { wallets } = getDefaultWallets({
  appName: 'DailyBase',
  projectId,
});

const connectors = connectorsForWallets(wallets, { appName: 'DailyBase', projectId });

export const config = createConfig({
  chains: [base],
  connectors,
  transports: {
    [base.id]: http(),
  },
});
