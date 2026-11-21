import Link from "next/link";
import { Heart, Building2, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E6E1D6] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <Logo className="w-9 h-9" />
              <span className="font-heading font-bold text-lg text-[#1C1917]">
                CivicResolve
              </span>
            </div>
            <p className="text-sm text-[#57534E] max-w-md leading-relaxed">
              Transparent municipal grievance intelligence platform connecting citizens directly with public administration and field engineering teams.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#57534E]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Open Civic Infrastructure Initiative • Municipal Helpline 1913</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-[#1C1917] mb-3 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-[#57534E]">
              <li>
                <Link href="/" className="hover:text-[#1B4332] transition-colors">
                  Complaints Feed
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-[#1B4332] transition-colors">
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#1B4332] transition-colors">
                  Civic Map
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-[#1B4332] transition-colors">
                  Accountability Scorecard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#1B4332] transition-colors">
                  Admin Operations
                </Link>
              </li>
            </ul>
          </div>

          {/* Municipal SLA Guarantees */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-[#1C1917] mb-3 uppercase tracking-wider">
              Service SLAs
            </h4>
            <ul className="space-y-2 text-xs text-[#57534E]">
              <li className="flex items-center justify-between pb-1 border-b border-[#F3EFE8]">
                <span>Critical Hazards</span>
                <span className="font-bold text-red-700">4 Hours</span>
              </li>
              <li className="flex items-center justify-between pb-1 border-b border-[#F3EFE8]">
                <span>Arterial Roads</span>
                <span className="font-bold text-amber-700">24 Hours</span>
              </li>
              <li className="flex items-center justify-between pb-1 border-b border-[#F3EFE8]">
                <span>Water & Sanitation</span>
                <span className="font-bold text-[#1B4332]">72 Hours</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Routine Maintenance</span>
                <span className="font-bold text-stone-600">7 Days</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E6E1D6] mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#57534E] gap-2">
          <p>© {new Date().getFullYear()} CivicResolve. Municipal Public Infrastructure Platform.</p>
          <p className="flex items-center gap-1">
            Built for transparent civic accountability & faster citizen redressal.
          </p>
        </div>
      </div>
    </footer>
  );
}
