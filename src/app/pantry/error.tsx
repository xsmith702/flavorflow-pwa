"use client";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="p-6 text-red-700">
      <p>Something went wrong: {error.message}</p>
      <button className="underline" onClick={reset}>Try again</button>
    </div>
  );
}
