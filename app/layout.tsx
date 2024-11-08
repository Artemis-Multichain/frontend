'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ImageProvider } from '@/context/ImageContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParticleConnectkit } from '@/connectkit';
import AllocationModal from '@/components/modals/AllocationModal';

const inter = Inter({ subsets: ['latin'] });

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AllocationModal />
      <body className={inter.className}>
        <ParticleConnectkit>
          <QueryClientProvider client={queryClient}>
            <ImageProvider>{children}</ImageProvider>
          </QueryClientProvider>
        </ParticleConnectkit>
      </body>
    </html>
  );
}
