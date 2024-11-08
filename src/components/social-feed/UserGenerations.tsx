import React, { useRef, useCallback, useEffect } from 'react';
import { useAccount } from '@particle-network/connectkit';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import FeedImageCard from '../cards/FeedImageCard';
import ImageSkeleton from '../skeleton/ImageSkeleton';

interface Prompt {
  id: number;
  ipfs_image_url: string;
  post_name: string;
  prompt: string;
  account_address: string;
  promptType: string;
  likes_count: number;
  comments_count: number;
  prompt_id: number;
  prompt_type: string;
  public: boolean;
  top_comments: any[];
}

const UserGenerations = () => {
  const { address } = useAccount();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const queryClient = useQueryClient();

  const fetchUserPrompts = async ({ pageParam = 1 }) => {
    if (!address) return { results: [], nextPage: null };
    const response = await axios.get(
      `${baseUrl}/socialfeed/feed/?user_account=${address}&page=${pageParam}&page_size=20`
    );

    // Filter the results to only include prompts where the account_address matches the connected address
    const filteredResults = response.data.results.filter(
      (prompt: Prompt) => prompt.account_address === address
    );

    return {
      results: filteredResults || [],
      nextPage: filteredResults.length === 20 ? pageParam + 1 : null,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['userPrompts', address],
    queryFn: fetchUserPrompts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!address,
  });

  useEffect(() => {
    if (address) {
      queryClient.removeQueries({ queryKey: ['userPrompts'] });
      refetch();
    }
  }, [address, queryClient, refetch]);

  const observer = useRef<IntersectionObserver | null>(null);
  interface LastElementRefProps {
    node: Element | null;
  }

  const lastElementRef = useCallback(
    (node: LastElementRefProps['node']) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        {
          root: null,
          rootMargin: '200px',
          threshold: 0,
        }
      );
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const renderItems = () => {
    return data?.pages.flatMap((page, pageIndex) =>
      page.results.map((prompt: Prompt, index: number) => (
        <div
          key={prompt.prompt_id}
          ref={
            pageIndex === data.pages.length - 1 &&
            index === page.results.length - 5
              ? lastElementRef
              : null
          }
        >
          <FeedImageCard
            index={index}
            imageUrl={prompt.ipfs_image_url}
            name={prompt.post_name}
            prompt={prompt.prompt}
            promptId={prompt.prompt_id}
            promptType={prompt.prompt_type}
            account={prompt.account_address}
            isEncrypted={prompt.prompt.startsWith('U2FsdGVkX1')}
          />
        </div>
      ))
    );
  };

  if (!address) {
    return (
      <div className="text-white">
        Please connect your wallet to view your generations.
      </div>
    );
  }

  if (status === 'error') {
    return <div className="text-white">Error: {(error as Error).message}</div>;
  }

  return (
    <div className="ml-[0px] mt-1">
      {status === 'success' && (!data || data.pages[0].results.length === 0) ? (
        <p className="text-white">You haven&apos;t created any prompts yet.</p>
      ) : (
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 400: 2, 500: 3, 700: 4, 900: 5 }}
        >
          <Masonry columnsCount={5} gutter="8px">
            {renderItems()}
            {isFetchingNextPage &&
              Array.from({ length: 5 }).map((_, index) => (
                <ImageSkeleton key={`skeleton-${index}`} index={index} />
              ))}
          </Masonry>
        </ResponsiveMasonry>
      )}
    </div>
  );
};

export default UserGenerations;
