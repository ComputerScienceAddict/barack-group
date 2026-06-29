"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-white">
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="max-w-md text-center text-sm text-slate-300">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
