import React from 'react';
import GenerationOutputCard from './cards/GenerationOutputCard';
import { useImages } from '@/context/ImageContext';

interface ImageObject {
  id: number;
  base64: string;
}

const GenerationOutput = () => {
  const { images } = useImages();

  return (
    <div className="pl-[75px] px-[30px] h-full grid grid-cols-1 md:grid-cols-2 gap-3 mx-auto pb-3">
      {images &&
        images.map((imageObj: ImageObject) => (
          <GenerationOutputCard
            key={imageObj.id}
            image={`data:image/jpeg;base64,${imageObj.base64}`}
          />
        ))}
    </div>
  );
};

export default GenerationOutput;
