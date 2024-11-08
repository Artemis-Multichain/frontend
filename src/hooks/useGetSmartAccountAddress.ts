import { useQuery } from '@tanstack/react-query';
import type { SmartAccount } from '@particle-network/aa';

/**
 * Custom hook to fetch and manage smart account address
 * @param smartAccount - The smart account instance from Particle Network
 * @returns Object containing the address and query state
 */
export const useGetSmartAccountAddress = (
  smartAccount: SmartAccount | null
) => {
  return useQuery({
    queryKey: ['smartAccountAddress', smartAccount?.getAddress()],
    queryFn: async () => {
      if (!smartAccount) {
        return null;
      }
      const address = await smartAccount.getAddress();
      return address;
    },
    enabled: !!smartAccount,
    staleTime: Infinity, // Address won't change for same smart account
    cacheTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 2,
  });
};

/**
 * Example usage with TypeScript types for the return value
 */
type UseSmartAccountAddressReturn = {
  address: string | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  refetch: () => Promise<string | null>;
};
