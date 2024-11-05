'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ImageProvider } from '@/context/ImageContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ParticleConnectkit } from '@/connectkit';

const inter = Inter({ subsets: ['latin'] });

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
