'use client';

import React from 'react';

import { ConnectKitProvider, createConfig } from '@particle-network/connectkit';
import { authWalletConnectors } from '@particle-network/connectkit/auth';
import type { Chain } from '@particle-network/connectkit/chains';
import { EntryPosition, wallet } from '@particle-network/connectkit/wallet';
import { aa } from '@particle-network/connectkit/aa';
import {
  baseSepolia,
  sepolia,
  arbitrumSepolia,
  optimismSepolia,
} from '@particle-network/connectkit/chains';
import { evmWalletConnectors } from '@particle-network/connectkit/evm';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY as string;
const appId = process.env.NEXT_PUBLIC_APP_ID as string;
const walletConnectProjectId = process.env
  .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

if (!projectId || !clientKey || !appId) {
  throw new Error('Please configure the Particle project in .env first!');
}

const supportChains: Chain[] = [];
supportChains.push(baseSepolia, sepolia, arbitrumSepolia, optimismSepolia);

const config = createConfig({
  projectId,
  clientKey,
  appId,
  appearance: {
    recommendedWallets: [
      { walletId: 'metaMask', label: 'Recommended' },
      { walletId: 'coinbaseWallet', label: 'Popular' },
    ],
    language: 'en-US',
  },
  walletConnectors: [
    authWalletConnectors(),
    // evm start
    evmWalletConnectors({
      metadata: {
        name: 'Artemis AI',
        icon:
          typeof window !== 'undefined'
            ? `${window.location.origin}/favicon.ico`
            : '',
        description: 'Generative AI social network',
        url: typeof window !== 'undefined' ? window.location.origin : '',
      },
      walletConnectProjectId: walletConnectProjectId,
    }),
    // evm end
  ],
  plugins: [
    wallet({
      visible: false,
      entryPosition: EntryPosition.BR,
    }),

    aa({
      name: 'BICONOMY',
      version: '2.0.0',
    }),
  ],
  chains: supportChains as unknown as readonly [Chain, ...Chain[]],
});

export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
  return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};
