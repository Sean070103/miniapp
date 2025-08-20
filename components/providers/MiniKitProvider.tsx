'use client';

import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { ReactNode } from 'react';
import { base } from 'wagmi/chains';

export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY;
  
  // If no API key is configured, render children without MiniKit provider
  if (!apiKey || apiKey === 'your_minikit_api_key_here') {
    console.warn('MiniKit API key not configured. Skipping MiniKit provider.');
    return <>{children}</>;
  }

  return (
    <MiniKitProvider
      apiKey={apiKey}
      chain={base}
    >
      {children}
    </MiniKitProvider>
  );
}
