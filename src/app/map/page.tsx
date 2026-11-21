"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Complaint } from "@/lib/types";
import { COMPLAINT_CATEGORIES, PRIORITY_LEVELS } from "@/lib/constants";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  MapPin,
  Search,
  Filter,
  Flame,
  Layers,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  X,
} from "lucide-react";
import Link from "next/link";

// Dynamic import with ssr: false ensures window / Leaflet never runs during Next.js SSR build
const CivicMap = dynamic(() => import("@/components/CivicMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[620px] rounded-2xl bg-[#F3EFE8] border border-[#E6E1D6] flex flex-col items-center justify-center animate-pulse">
      <MapPin className="w-10 h-10 text-[#1B4332] mb-3 animate-bounce" />
      <span className="font-heading font-semibold text-sm text-[#1C1917]">
        Initializing OpenStreetMap & Spatial Grid...
      </span>
      <span className="text-xs text-[#57534E] mt-1">
        Loading real-time GIS coordinates and civic incident markers
      </span>
    </div>
  ),
});

export default function MapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showHotspots, setShowHotspots] = useState(true);

  // Selected item on map
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const fetchMapData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/complaints?limit=100");
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints);
      } else {
        setError(data.error || "Failed to load GIS data.");
      }
    } catch {
      setError("Network error connecting to municipal spatial servers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          c.title.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedCategory !== "All" && c.category !== selectedCategory) return false;
      if (selectedPriority !== "All" && c.priority !== selectedPriority) return false;
      if (selectedStatus !== "All" && c.status !== selectedStatus) return false;
      return true;
    });
  }, [complaints, search, selectedCategory, selectedPriority, selectedStatus]);

  // Complaints with valid GPS
  const locatedList = useMemo(() => {
    return filtered.filter(
      (c) =>
        c.coordinates &&
        typeof c.coordinates.lat === "number" &&
        typeof c.coordinates.lng === "number"
    );
  }, [filtered]);

  // Complaints without GPS
  const unlocatedList = useMemo(() => {
    return filtered.filter(
      (c) =>
        !c.coordinates ||
        typeof c.coordinates.lat !== "number" ||
        typeof c.coordinates.lng !== "number"
    );
  }, [filtered]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-warm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFE8] text-xs font-semibold text-[#1B4332] mb-2">
              <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Spatial Municipal GIS • OpenStreetMap Layer</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1C1917]">
              Interactive Civic Intelligence Map
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1">
              Real-time geographical distribution of public infrastructure grievances, density clusters, and municipal response zones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showHotspots
                  ? "bg-[#FDF2EC] text-[#C85A32] border-[#F2D4C7] shadow-sm"
                  : "bg-white text-stone-600 border-[#E6E1D6]"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{showHotspots ? "Hotspots Visible" : "Hotspots Hidden"}</span>
            </button>

            <button
              onClick={fetchMapData}
              className="p-2.5 bg-[#FAF8F5] hover:bg-[#F3EFE8] border border-[#E6E1D6] rounded-xl text-[#57534E] transition-colors"
              title="Refresh Map"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-4 shadow-warm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#57534E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search locality, street name, tracking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-[#1C1917]"
            >
              <option value="All">All Categories</option>
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-[#1C1917]"
            >
              <option value="All">All Priorities</option>
              {PRIORITY_LEVELS.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-[#1C1917]"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Verification">Awaiting Verification</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>
        </div>

        {/* Map & Side Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Main Leaflet Map */}
          <div className="lg:col-span-3">
            <CivicMap
              complaints={locatedList}
              selectedComplaintId={selectedComplaint?.id}
              onSelectComplaint={(c) => setSelectedComplaint(c)}
              showHotspots={showHotspots}
            />
          </div>

          {/* Right Sidebar: Selected Card & Unlocated List */}
          <div className="space-y-4">
            {/* Active Selected Card if clicked on map */}
            {selectedComplaint && (
              <div className="bg-white border border-[#E6E1D6] rounded-2xl p-5 shadow-warm space-y-3 animate-in fade-in">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-[#1B4332] bg-[#F3EFE8] px-2 py-0.5 rounded">
                    {selectedComplaint.id}
                  </span>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="p-1 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-heading font-bold text-sm text-[#1C1917]">
                  {selectedComplaint.title}
                </h3>

                <div className="flex items-center gap-2">
                  <PriorityBadge priority={selectedComplaint.priority} />
                  <StatusBadge status={selectedComplaint.status} />
                </div>

                <p className="text-xs text-[#57534E] leading-relaxed line-clamp-3">
                  {selectedComplaint.description}
                </p>

                <div className="text-[11px] text-[#57534E] pt-2 border-t border-[#E6E1D6] space-y-1">
                  <div className="flex justify-between">
                    <span>Dept:</span>
                    <span className="font-medium text-[#1B4332]">{selectedComplaint.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filed:</span>
                    <span>{formatDate(selectedComplaint.createdAt)}</span>
                  </div>
                </div>

                <Link
                  href={`/complaint/${selectedComplaint.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#2D6A4F] transition-colors"
                >
                  <span>Open Full Audit Record</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Unlocated Complaints Card */}
            <div className="bg-white border border-[#E6E1D6] rounded-2xl p-5 shadow-warm">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E6E1D6]">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#57534E]" />
                  <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-[#1C1917]">
                    Unlocated Grievances ({unlocatedList.length})
                  </h4>
                </div>
              </div>
              <p className="text-[11px] text-[#57534E] mb-3 leading-snug">
                Reports submitted with descriptive street landmarks but without GPS coordinates. Public privacy is preserved by not fabricating coordinates.
              </p>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {unlocatedList.length === 0 ? (
                  <p className="text-xs text-stone-400 italic text-center py-4">
                    All filtered grievances have verified GPS coordinates.
                  </p>
                ) : (
                  unlocatedList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-xs space-y-1 hover:border-[#1B4332] transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] font-bold text-[#1B4332]">
                          {item.id}
                        </span>
                        <PriorityBadge priority={item.priority} showIcon={false} />
                      </div>
                      <Link
                        href={`/complaint/${item.id}`}
                        className="font-semibold text-[#1C1917] hover:underline block truncate"
                      >
                        {item.title}
                      </Link>
                      <p className="text-[11px] text-[#57534E] truncate">
                        {item.location}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
