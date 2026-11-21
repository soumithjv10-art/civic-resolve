import Link from "next/link";
import { ShieldAlert, Heart, Building2, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E6E1D6] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#1B4332] flex items-center justify-center text-white">
                <ShieldAlert className="w-5 h-5 text-[#C85A32]" />
              </div>
              <span className="font-heading font-bold text-lg text-[#1C1917]">
                CivicResolve
              </span>
            </div>
            <p className="text-sm text-[#57534E] max-w-md leading-relaxed">
              An intelligent, transparent civic grievance intelligence platform bridging citizens and municipal authorities. Powered by Gemini 3.8 Flash, verified by community audit, and governed by strict municipal SLAs.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#57534E]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All reported data is public record under the Open Civic Infrastructure charter.</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-[#1C1917] mb-3 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-[#57534E]">
              <li>
                <Link href="/" className="hover:text-[#1B4332] transition-colors">
                  Public Grievance Feed
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-[#1B4332] transition-colors">
                  Submit New Complaint
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#1B4332] transition-colors">
                  Interactive Civic Map
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-[#1B4332] transition-colors">
                  Department Scorecards
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#1B4332] transition-colors">
                  Officer Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* SLA commitments */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-[#1C1917] mb-3 uppercase tracking-wider">
              SLA Commitments
            </h4>
            <ul className="space-y-2 text-xs text-[#57534E]">
              <li className="flex justify-between items-center py-1 border-b border-[#F3EFE8]">
                <span>Critical Hazards:</span>
                <span className="font-semibold text-red-700">4 Hours</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-[#F3EFE8]">
                <span>High Urgency:</span>
                <span className="font-semibold text-orange-700">24 Hours</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-[#F3EFE8]">
                <span>Medium (Routine):</span>
                <span className="font-semibold text-amber-800">72 Hours</span>
              </li>
              <li className="flex justify-between items-center py-1">
                <span>Low (Aesthetic):</span>
                <span className="font-semibold text-emerald-800">7 Days</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E6E1D6] mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#57534E] gap-4">
          <p>© {new Date().getFullYear()} CivicResolve. Built for public good and civic transparency.</p>
          <div className="flex items-center space-x-4">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>•</span>
            <span>Warm Civic Daylight System</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
