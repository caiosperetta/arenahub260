export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#F1F5F9] rounded-[12px] ${className}`} />
  )
}

export function SkeletonRow() {
  return (
    <tr>
      <td colSpan={99} className="py-3 px-4">
        <div className="animate-pulse h-4 bg-[#F1F5F9] rounded w-full" />
      </td>
    </tr>
  )
}

export function SkeletonMetricCard() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 animate-pulse">
      <div className="h-3 bg-[#F1F5F9] rounded w-1/2 mb-3" />
      <div className="h-7 bg-[#F1F5F9] rounded w-1/3 mb-2" />
      <div className="h-3 bg-[#F1F5F9] rounded w-1/4" />
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number, cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-[#E2E8F0]">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="py-3 px-4">
              <div className="animate-pulse h-4 bg-[#F1F5F9] rounded"
                   style={{ width: `${60 + Math.random() * 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="animate-pulse h-3 bg-[#F1F5F9] rounded w-24" />
          <div className="animate-pulse h-10 bg-[#F1F5F9] rounded-[8px] w-full" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonPageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-8 w-8 border-2
                      border-[#22C55E] border-t-transparent" />
    </div>
  )
}
