// @ts-nocheck
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ImageSkeleton = ({ index }) => {
  let height;
  switch (index % 4) {
    case 0:
      height = 'h-[240px]';
      break;
    case 1:
      height = 'h-[290px]';
      break;
    case 2:
      height = 'h-[340px]';
      break;
    case 3:
      height = 'h-[390px]';
      break;
    default:
      height = 'h-[600px]';
  }

  return (
    <div className={`relative ${height} m-1 rounded-lg group overflow-hidden`}>
      <Skeleton className={height} baseColor="#111" highlightColor="#A9A9A9" />
      <div className="absolute bottom-2 left-2 rounded p-1"></div>
      <div className="like-button absolute top-2 right-2 rounded-full w-8 h-8">
        <Skeleton
          circle={true}
          height={32}
          width={32}
          baseColor="#111"
          highlightColor="#A9A9A9"
        />
      </div>
    </div>
  );
};

export default ImageSkeleton;
