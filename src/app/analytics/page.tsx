"use client";

import { useEffect, useState } from "react";
import { AnalyticsData } from "@/lib/types";
import { DepartmentScorecard } from "@/components/DepartmentScorecard";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json.analytics);
      } else {
        setError(json.error || "Failed to load municipal analytics");
      }
    } catch {
      setError("Network error fetching accountability telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 sm:p-8 shadow-warm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE8] text-xs font-semibold text-[#1B4332] mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Municipal Accountability & Performance Audit</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-[#1C1917] tracking-tight">
              Predictive Civic Analytics & Scorecards
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1 max-w-2xl leading-relaxed">
              Real-time accountability telemetry computed directly from public grievance records. Monitoring municipal resolution throughput, SLA adherence, and AI-assisted audit accuracy.
            </p>
          </div>

          <div>
            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF8F5] hover:bg-[#F3EFE8] border border-[#E6E1D6] rounded-xl text-xs font-semibold text-[#1C1917] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-white rounded-2xl border border-[#E6E1D6] p-4" />
              ))}
            </div>
            <div className="h-80 bg-white rounded-2xl border border-[#E6E1D6] animate-pulse" />
          </div>
        ) : error || !data ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-800 max-w-lg mx-auto">
            <p className="font-semibold text-sm mb-2">{error || "No data available."}</p>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-red-700 text-white rounded-lg text-xs font-semibold hover:bg-red-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white border border-[#E6E1D6] rounded-2xl p-4 shadow-warm flex flex-col justify-between">
                <span className="text-xs text-[#57534E] font-medium">Total Lodged</span>
                <span className="font-heading font-bold text-2xl sm:text-3xl text-[#1C1917] mt-1">
                  {data.totalComplaints}
                </span>
                <span className="text-[10px] text-stone-400 mt-1">Public Grievances</span>
              </div>

              <div className="bg-white border border-[#E6E1D6] rounded-2xl p-4 shadow-warm flex flex-col justify-between">
                <span className="text-xs text-[#57534E] font-medium">Verified Resolved</span>
                <span className="font-heading font-bold text-2xl sm:text-3xl text-emerald-700 mt-1">
                  {data.resolvedComplaints}
                </span>
                <span className="text-[10px] text-emerald-600 mt-1">Audit Closed</span>
              </div>

              <div className="bg-white border border-[#E6E1D6] rounded-2xl p-4 shadow-warm flex flex-col justify-between">
                <span className="text-xs text-[#57534E] font-medium">Resolution Rate</span>
                <span className="font-heading font-bold text-2xl sm:text-3xl text-[#1B4332] mt-1">
                  {data.overallResolutionRate}%
                </span>
                <span className="text-[10px] text-stone-500 mt-1">Overall Target</span>
              </div>

              <div className="bg-white border border-[#E6E1D6] rounded-2xl p-4 shadow-warm flex flex-col justify-between">
                <span className="text-xs text-[#57534E] font-medium">SLA Compliance</span>
                <span className="font-heading font-bold text-2xl sm:text-3xl text-amber-800 mt-1">
                  {data.slaComplianceRate}%
                </span>
                <span className="text-[10px] text-stone-500 mt-1">Within Deadline</span>
              </div>

              <div className="bg-white border border-[#E6E1D6] rounded-2xl p-4 shadow-warm flex flex-col justify-between">
                <span className="text-xs text-[#57534E] font-medium">Avg Turnaround</span>
                <span className="font-heading font-bold text-2xl sm:text-3xl text-[#1C1917] mt-1">
                  {data.avgResolutionHours}h
                </span>
                <span className="text-[10px] text-stone-500 mt-1">From Intake to Fix</span>
              </div>

              <div className="bg-white border border-[#E6E1D6] rounded-2xl p-4 shadow-warm flex flex-col justify-between">
                <span className="text-xs text-[#57534E] font-medium">SLA Overdue</span>
                <span className="font-heading font-bold text-2xl sm:text-3xl text-red-700 mt-1">
                  {data.overdueComplaints}
                </span>
                <span className="text-[10px] text-red-600 mt-1">Breached Target</span>
              </div>
            </div>

            {/* Visual Analytics Dashboard */}
            <AnalyticsDashboard data={data} />

            {/* Department Scorecard */}
            <DepartmentScorecard metrics={data.departmentMetrics} />
          </>
        )}
      </div>
    </div>
  );
}
