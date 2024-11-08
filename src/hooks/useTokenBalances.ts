import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
];

interface ChainConfig {
  rpcUrl: string;
  usdcAddress: string;
  decimals: number;
}

const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  optimism: {
    rpcUrl: 'https://sepolia.optimism.io',
    usdcAddress: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7', 
    decimals: 6,
  },
  arbitrum: {
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    usdcAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', 
    decimals: 6,
  },
  base: {
    rpcUrl: 'https://sepolia.base.org',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7c', // Base Sepolia USDC
    decimals: 6,
  },
  bnb: {
    rpcUrl: 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
    usdcAddress: '0x9100DA3f769B3a8b23F5646eE1B3De397EC33774', // BNB Testnet USDC
    decimals: 6,
  },
  ethereum: {
    rpcUrl: 'https://rpc.ankr.com/eth_sepolia',
    usdcAddress: '0x8267cF9254734C6Eb452a7bb9AAF97B392258b21', // Sepolia USDC
    decimals: 6,
  },
};

export { CHAIN_CONFIGS, USDC_ABI };