// @ts-nocheck
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PromptCardSkeleton = () => {
  return (
    <div className="border-gradient relative mb-10 flex justify-center items-center rounded-xl">
      <div className="w-full p-2 h-full cursor-pointer overflow-hidden rounded-2xl flex flex-col items-center bg-black">
        <Skeleton
          height={300}
          width={280}
          className="rounded-[30px] pt-2"
          baseColor="#111"
          highlightColor="#A9A9A9"
        />

        <div className="flex items-center justify-between gap-4 w-full mt-2">
          <div className="w-full">
            <h3 className="mt-1 text-center">
              <Skeleton
                height={20}
                width={200}
                baseColor="#111"
                highlightColor="#A9A9A9"
              />
            </h3>

            <div className="flex items-center justify-between mt-2">
              <Skeleton
                height={20}
                width={100}
                baseColor="#111"
                highlightColor="#A9A9A9"
              />
              <Skeleton
                height={20}
                width={100}
                baseColor="#111"
                highlightColor="#A9A9A9"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptCardSkeleton;
