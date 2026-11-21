"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { ComplaintCard } from "@/components/ComplaintCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { Complaint, ComplaintCategory, PriorityLevel, ComplaintStatus } from "@/lib/types";
import { COMPLAINT_CATEGORIES, PRIORITY_LEVELS, DEPARTMENTS } from "@/lib/constants";
import { Search, Filter, RefreshCw, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/complaints");
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints);
      } else {
        setError(data.error || "Failed to load civic complaints");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error connecting to municipal database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSeedComplaints = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchComplaints();
      }
    } catch (err) {
      console.error("Seed error:", err);
    } finally {
      setSeeding(false);
    }
  };

  const handleUpvoteUpdate = useCallback((id: string, newCount: number) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, upvotes: newCount } : c))
    );
  }, []);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Category
      if (selectedCategory !== "All" && c.category !== selectedCategory) {
        return false;
      }
      // Priority
      if (selectedPriority !== "All" && c.priority !== selectedPriority) {
        return false;
      }
      // Status
      if (selectedStatus !== "All" && c.status !== selectedStatus) {
        return false;
      }
      // Department
      if (selectedDepartment !== "All" && c.department !== selectedDepartment) {
        return false;
      }
      return true;
    });
  }, [complaints, searchQuery, selectedCategory, selectedPriority, selectedStatus, selectedDepartment]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedPriority("All");
    setSelectedStatus("All");
    setSelectedDepartment("All");
  };

  return (
    <div className="min-h-screen">
      {/* Editorial Hero */}
      <Hero />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Real-time stats bar */}
        {!loading && <StatsBar complaints={complaints} />}

        {/* Filters & Search Control Bar */}
        <div className="bg-[#FFFFFF] border border-[#E6E1D6] rounded-2xl p-4 sm:p-5 shadow-warm mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#57534E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              >
                <option value="All">{t.allCategories}</option>
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Priority */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              >
                <option value="All">{t.allPriorities}</option>
                {PRIORITY_LEVELS.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri} Priority
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              >
                <option value="All">{t.allStatuses}</option>
                <option value="Reported">Reported</option>
                <option value="In Progress">In Progress</option>
                <option value="Awaiting Verification">Awaiting Verification</option>
                <option value="Resolved">Resolved</option>
                <option value="Reopened">Reopened</option>
              </select>

              {/* Refresh button */}
              <button
                onClick={fetchComplaints}
                className="p-2 bg-[#FAF8F5] hover:bg-[#F3EFE8] border border-[#E6E1D6] rounded-xl text-[#57534E] transition-colors"
                title="Refresh Grievance Feed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Active filter pills */}
          {(selectedCategory !== "All" ||
            selectedPriority !== "All" ||
            selectedStatus !== "All" ||
            searchQuery) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E6E1D6] text-xs text-[#57534E]">
              <span className="font-semibold text-[#1C1917]">Active Filters:</span>
              {selectedCategory !== "All" && (
                <span className="bg-[#F3EFE8] px-2 py-0.5 rounded-full border border-[#E6E1D6]">
                  {selectedCategory}
                </span>
              )}
              {selectedPriority !== "All" && (
                <span className="bg-[#F3EFE8] px-2 py-0.5 rounded-full border border-[#E6E1D6]">
                  {selectedPriority}
                </span>
              )}
              {selectedStatus !== "All" && (
                <span className="bg-[#F3EFE8] px-2 py-0.5 rounded-full border border-[#E6E1D6]">
                  {selectedStatus}
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-[#C85A32] hover:underline font-medium ml-auto"
              >
                {t.resetFilters}
              </button>
            </div>
          )}
        </div>

        {/* Complaints Feed Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#1C1917]">
                {t.feedTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E]">
                {t.feedCountPrefix} {filteredComplaints.length} {t.feedCountSuffix}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-800 max-w-lg mx-auto">
              <p className="font-semibold text-sm mb-2">{error}</p>
              <button
                onClick={fetchComplaints}
                className="px-4 py-2 bg-red-700 text-white rounded-lg text-xs font-semibold hover:bg-red-800"
              >
                Retry Loading
              </button>
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState
              title="No civic complaints reported yet"
              description="Be the first to report an infrastructure or public safety issue in your ward, or initialize the municipal feed."
              actionText={seeding ? "Initializing Feed..." : "Populate Municipal Feed"}
              onAction={handleSeedComplaints}
            />
          ) : filteredComplaints.length === 0 ? (
            <EmptyState
              title="No complaints match current filters"
              description="Try adjusting your keyword search, category, or status criteria to see other reported municipal issues."
              actionText="Reset Filters"
              onAction={resetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComplaints.map((item) => (
                <ComplaintCard
                  key={item.id}
                  complaint={item}
                  onUpvote={handleUpvoteUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
