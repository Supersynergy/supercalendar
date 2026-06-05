"use client";

import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CalendarError({ error, reset }: ErrorProps) {
  return (
    <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col items-center justify-center gap-4 px-8 py-24 text-center">
      <h2 className="text-lg font-semibold">Something went wrong loading the calendar.</h2>
      <p className="max-w-md text-sm text-muted-foreground">{error.message || "An unexpected error occurred."}</p>
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
