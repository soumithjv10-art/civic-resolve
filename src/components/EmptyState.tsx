import Link from "next/link";
import { Inbox, PlusCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#E6E1D6] bg-[#FFFFFF] shadow-warm max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-full bg-[#F3EFE8] flex items-center justify-center mx-auto mb-4 text-[#57534E]">
        <Inbox className="w-6 h-6 text-[#1B4332]" />
      </div>
      <h3 className="font-heading font-semibold text-lg text-[#1C1917] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[#57534E] mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-medium transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-sm font-medium transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}
