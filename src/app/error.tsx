"use client";
import { useEffect } from "react";

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
    <div className="container mx-auto px-4 py-10">
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-300 mb-4">{error.message || "Internal Server Error"}</p>
        {error.digest && (
          <p className="text-xs text-gray-500 mb-4">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-10 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
