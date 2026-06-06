import { Skeleton } from "@/components/ui/skeleton";

// View-agnostic loading shell: mirrors the calendar chrome (toolbar + framed
// content) without faking a month grid, so it stays neutral for every view and
// the swap to real content has no layout jump.
export default function Loading() {
  return (
    <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-4 px-8 py-4">
      <div className="overflow-hidden rounded-xl border">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-14 rounded-lg" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        <div className="h-[640px] w-full" />
      </div>
    </div>
  );
}
