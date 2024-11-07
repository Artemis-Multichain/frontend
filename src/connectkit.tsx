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
  base,
  arbitrum,
} from '@particle-network/connectkit/chains';
import { evmWalletConnectors } from '@particle-network/connectkit/evm';
import { useAAStore } from './store/aaStore';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY as string;
const appId = process.env.NEXT_PUBLIC_APP_ID as string;
const walletConnectProjectId = process.env
  .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

if (!projectId || !clientKey || !appId) {
  throw new Error('Please configure the Particle project in .env first!');
}

const supportChains: Chain[] = [
  base,
  arbitrum,
  baseSepolia,
  sepolia,
  arbitrumSepolia,
  optimismSepolia,
];

// Create config factory function that takes isAADisabled as parameter
const createParticleConfig = (isAADisabled: boolean) => {
  return createConfig({
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
    ],
    plugins: [
      wallet({
        visible: false,
        entryPosition: EntryPosition.BR,
      }),
      // Only include AA plugin if not disabled
      ...(!isAADisabled
        ? [
            aa({
              name: 'BICONOMY',
              version: '2.0.0',
            }),
          ]
        : []),
    ],
    chains: supportChains as unknown as readonly [Chain, ...Chain[]],
  });
};

export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
  const isAADisabled = useAAStore((state) => state.isAADisabled);
  const config = createParticleConfig(isAADisabled);

  return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};
