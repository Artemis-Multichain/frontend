'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ImageObject {
  id: number;
  base64: string;
}

interface ImageContextType {
  images: ImageObject[];
  setImages: React.Dispatch<React.SetStateAction<ImageObject[]>>;
  prompts: string;
  setPrompts: React.Dispatch<React.SetStateAction<string>>;
  challengeDescription: string;
  setChallengeDescription: React.Dispatch<React.SetStateAction<string>>;
  submissionDuration: string;
  setSubmissionDuration: React.Dispatch<React.SetStateAction<string>>;
  submissionStartTime: string;
  setSubmissionStartTime: React.Dispatch<React.SetStateAction<string>>;
  submissionHeaderIpfsUri: string;
  SetSubmissionHeaderIpfsUri: React.Dispatch<React.SetStateAction<string>>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImages = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImages must be used within an ImageProvider');
  }
  return context;
};

interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  const [images, setImages] = useState<ImageObject[]>([]);
  const [prompts, setPrompts] = useState<string>('');
  const [submissionDuration, setSubmissionDuration] = useState<string>('');
  const [challengeDescription, setChallengeDescription] = useState<string>('');
  const [submissionStartTime, setSubmissionStartTime] = useState<string>('');
  const [submissionHeaderIpfsUri, SetSubmissionHeaderIpfsUri] =
    useState<string>('');

  return (
    <ImageContext.Provider
      value={{
        images,
        setImages,
        prompts,
        setPrompts,
        submissionDuration,
        setSubmissionDuration,
        submissionStartTime,
        setSubmissionStartTime,
        submissionHeaderIpfsUri,
        SetSubmissionHeaderIpfsUri,
        challengeDescription,
        setChallengeDescription,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
