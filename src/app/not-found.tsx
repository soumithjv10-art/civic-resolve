import Link from "next/link";
import { ArrowLeft, MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full bg-white border border-[#E6E1D6] rounded-2xl p-8 shadow-warm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F3EFE8] flex items-center justify-center mx-auto text-[#1B4332]">
          <MapPinOff className="w-7 h-7 text-[#C85A32]" />
        </div>

        <h1 className="font-heading font-extrabold text-3xl text-[#1C1917]">
          404 — Page Not Found
        </h1>

        <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
          The requested municipal civic page or grievance record does not exist or may have been archived.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#2D6A4F] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Civic Feed</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
