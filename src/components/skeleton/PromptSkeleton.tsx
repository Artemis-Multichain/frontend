// @ts-nocheck
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PromptSkeleton = () => {
  return (
    <div className="relative border-[10px] border-[#292828] rounded-md m-2 p-2">
      <Skeleton height={118} baseColor="#111" highlightColor="#E0E0E0" />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <span className="text-gray-300 text-md bg-black bg-opacity-70 p-3 rounded-md flex flex-col justify-center items-center"></span>
      </div>
    </div>
  );
};

export default PromptSkeleton;
