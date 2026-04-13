'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0b0b0f] text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-white/40 mb-8 text-center max-w-md">
        AI Nexus encountered an unexpected error. Don't worry, your chats are safe.
      </p>
      <Button onClick={() => reset()} className="bg-blue-600 hover:bg-blue-500">
        Try again
      </Button>
    </div>
  );
}
