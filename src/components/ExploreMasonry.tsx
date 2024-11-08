import React, { useEffect, useState, useRef, useCallback } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import axios from 'axios';
import ImageCard from './cards/ImageCard';
import ImageSkeleton from './skeleton/ImageSkeleton';

interface Prompt {
  id: number;
  ipfs_image_url: string;
  post_name: string;
  prompt: string;
  account_address: string;
  promptType: string;
  likes_count: number;
}

const ExploreMasonry = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [publicPrompts, setPublicPrompts] = useState<Prompt[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1);
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
    [isLoading, hasMore]
  );

  useEffect(() => {
    fetchPublicPrompts();
  }, [page]);

  const fetchPublicPrompts = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await axios.get<{ prompts: Prompt[] }>(
        `${BASE_URL}/prompts/get-public-prompts/?page=${page}&page_size=20`
      );

      setPublicPrompts((prevPrompts) => {
        const newPrompts = response.data.prompts.filter(
          (newPrompt) =>
            !prevPrompts.some((prevPrompt) => prevPrompt.id === newPrompt.id)
        );
        return [...prevPrompts, ...newPrompts];
      });
      setHasMore(response.data.prompts.length === 20);
    } catch (error) {
      console.error('Error fetching public prompts:', error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  console.log('public ', publicPrompts);

  const renderItems = () => {
    const items = [];
    for (let i = 0; i < publicPrompts.length; i++) {
      const prompt = publicPrompts[i];
      items.push(
        <div
          key={prompt.id}
          ref={i === publicPrompts.length - 5 ? lastElementRef : null}
        >
          <ImageCard
            index={i}
            imageUrl={prompt.ipfs_image_url}
            name={prompt.post_name}
            prompt={prompt.prompt}
            promptId={prompt.id}
            promptType="public"
            account={prompt.account_address}
          />
        </div>
      );
    }
    return items;
  };

  if (isInitialLoad) {
    return (
      <div className="ml-[230px] mt-1">
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 400: 2, 500: 3, 700: 4, 900: 5 }}
        >
          <Masonry columnsCount={5} gutter="8px">
            {Array.from({ length: 20 }).map((_, index) => (
              <ImageSkeleton key={`initial-skeleton-${index}`} index={index} />
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </div>
    );
  }

  return (
    <div className="ml-[230px] mt-1">
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 400: 2, 500: 3, 700: 4, 900: 5 }}
      >
        <Masonry columnsCount={5} gutter="8px">
          {renderItems()}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};

export default ExploreMasonry;
