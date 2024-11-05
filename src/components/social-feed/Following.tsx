import React, { useRef, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import FeedImageCard from '../cards/FeedImageCard';
import ImageSkeleton from '../skeleton/ImageSkeleton';

interface Post {
  id: number;
  ipfs_image_url: string;
  post_name: string;
  prompt: string;
  account_address: string;
  promptType: string;
  likes_count: number;
}

const Following = () => {
  const account = '';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchFollowingPosts = async ({ pageParam = 1 }) => {
    if (!account?.address) return { results: [], nextPage: null };
    const response = await axios.get(
      `${baseUrl}/socialfeed/feed/?user_account=${account.address}&page=${pageParam}&page_size=20`
    );

    return {
      results: response.data.results || [],
      nextPage: response.data.results?.length === 10 ? pageParam + 1 : null,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ['followingPosts', account?.address],
    queryFn: fetchFollowingPosts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!account?.address,
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node) => {
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

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const shuffledPosts = useMemo(() => {
    if (!data) return [];
    const allPosts = data.pages.flatMap((page) => page.results);
    return shuffleArray([...allPosts]);
  }, [data]);

  const renderItems = () => {
    return shuffledPosts.map((post: Post, index: number) => (
      <div
        key={post.id}
        ref={index === shuffledPosts.length - 3 ? lastElementRef : null}
      >
        <FeedImageCard
          index={index}
          imageUrl={post.ipfs_image_url}
          name={post.post_name}
          prompt={post.prompt}
          promptId={post.id}
          promptType={post.promptType}
          account={post.account_address}
          isEncrypted={post.prompt.startsWith('U2FsdGVkX1')}
        />
      </div>
    ));
  };

  if (!account) {
    return (
      <div className="text-white">
        Please connect your wallet to view posts from users you're following.
      </div>
    );
  }

  if (status === 'error') {
    return <div className="text-white">Error: {(error as Error).message}</div>;
  }

  return (
    <div className="ml-[0px] mt-1">
      {status === 'success' && shuffledPosts.length === 0 ? (
        <p className="text-white">No posts from users you're following yet.</p>
      ) : (
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 400: 2, 500: 3, 700: 4, 900: 5 }}
        >
          <Masonry columnsCount={5} gutter="8px">
            {renderItems()}
            {isFetchingNextPage &&
              Array.from({ length: 3 }).map((_, index) => (
                <ImageSkeleton key={`skeleton-${index}`} index={index} />
              ))}
          </Masonry>
        </ResponsiveMasonry>
      )}
    </div>
  );
};

export default Following;
