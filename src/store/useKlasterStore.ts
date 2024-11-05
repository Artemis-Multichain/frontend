// // src/store/useKlasterStore.ts

// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import {
//   initKlaster,
//   klasterNodeHost,
//   loadBicoV2Account,
//   buildMultichainReadonlyClient,
//   buildRpcInfo,
//   buildTokenMapping,
//   deployment,
// } from 'klaster-sdk';
// import { formatEther, PublicClient } from 'viem';
// import { sepolia, baseSepolia } from 'viem/chains';
// import { formatBalance } from '@/utils/particle-utils';

// interface KlasterState {
//   klasterAddress: string | null;
//   klasterInstance: any | null;
//   isLoading: boolean;
//   error: string | null;

//   balance: string | null;
//   isLoadingBalance: boolean;
//   lastBalanceUpdate: number | null;
//   initializeKlaster: (ownerAddress: string) => Promise<void>;
//   resetKlasterStore: () => void;
//   fetchBalance: (publicClient: PublicClient) => Promise<void>;
// }

// export const useKlasterStore = create<KlasterState>()(
//   persist(
//     (set, get) => ({
//       klasterAddress: null,
//       klasterInstance: null,
//       isLoading: false,
//       error: null,
//       balance: null,
//       isLoadingBalance: false,
//       lastBalanceUpdate: null,

//       initializeKlaster: async (ownerAddress: string) => {
//         if (!ownerAddress) return;
//         set({ isLoading: true, error: null });

//         try {
//           const klaster = await initKlaster({
//             accountInitData: loadBicoV2Account({
//               owner: ownerAddress,
//             }),
//             nodeUrl: klasterNodeHost.default,
//           });

//           // Store both instance and account separately
//           const klasterAccountAddress = klaster.account.deployments[0].address;

//           set({
//             klasterAddress: klasterAccountAddress,
//             klasterInstance: klaster,
//             account: klaster.account, // Store account separately
//             isLoading: false,
//           });

//           console.log('Klaster initialized:', {
//             address: klasterAccountAddress,
//             account: klaster.account,
//           });
//         } catch (err) {
//           console.error('Error initializing Klaster:', err);
//           set({
//             error:
//               err instanceof Error
//                 ? err.message
//                 : 'Failed to initialize Klaster',
//             isLoading: false,
//           });
//         }
//       },

//       fetchBalance: async (publicClient: PublicClient | null) => {
//         if (!publicClient) return;

//         const state = get();
//         const now = Date.now();

//         if (!state.klasterAddress) return;
//         if (state.lastBalanceUpdate && now - state.lastBalanceUpdate < 30000)
//           return;

//         set({ isLoadingBalance: true });
//         try {
//           const balanceResponse = await publicClient.getBalance({
//             address: state.klasterAddress as `0x${string}`,
//           });

//           if (balanceResponse) {
//             const balanceInEther = formatEther(balanceResponse);
//             set({
//               balance: formatBalance(balanceInEther),
//               lastBalanceUpdate: now,
//             });
//           } else {
//             set({ balance: '0.0', lastBalanceUpdate: now });
//           }
//         } catch (error) {
//           console.error('Error fetching balance:', error);
//           set({ balance: '0.0' });
//         } finally {
//           set({ isLoadingBalance: false });
//         }
//       },

//       resetKlasterStore: () => {
//         set({
//           klasterAddress: null,
//           klasterInstance: null,
//           isLoading: false,
//           error: null,
//           balance: null,
//           isLoadingBalance: false,
//           lastBalanceUpdate: null,
//         });
//       },
//     }),
//     {
//       name: 'klaster-storage',
//       partialize: (state) => ({
//         klasterAddress: state.klasterAddress,
//         balance: state.balance,
//         lastBalanceUpdate: state.lastBalanceUpdate,
//       }),
//     }
//   )
// );
