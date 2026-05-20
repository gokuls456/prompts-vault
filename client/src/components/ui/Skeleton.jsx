// Skeleton loading components
export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="skeleton aspect-[4/5] w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-1/2 rounded-full" />
        <div className="flex gap-2 mt-3">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TextSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton h-4 rounded-full ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}
