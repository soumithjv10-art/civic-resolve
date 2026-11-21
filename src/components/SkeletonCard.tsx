export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E6E1D6] p-5 shadow-warm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-4 bg-[#F3EFE8] rounded w-28"></div>
          <div className="h-5 bg-[#E6E1D6] rounded w-64"></div>
        </div>
        <div className="h-6 bg-[#F3EFE8] rounded-full w-24"></div>
      </div>
      <div className="h-3.5 bg-[#F3EFE8] rounded w-full mb-2"></div>
      <div className="h-3.5 bg-[#F3EFE8] rounded w-4/5 mb-4"></div>
      <div className="flex justify-between items-center pt-3 border-t border-[#F3EFE8]">
        <div className="h-4 bg-[#F3EFE8] rounded w-32"></div>
        <div className="h-8 bg-[#F3EFE8] rounded-lg w-20"></div>
      </div>
    </div>
  );
}
