"use client";

import { useEffect, useState } from "react";
import { Complaint, ComplaintStatus, PriorityLevel } from "@/lib/types";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { SLAIndicator } from "@/components/SLAIndicator";
import { ResolutionVerification } from "@/components/ResolutionVerification";
import { COMPLAINT_CATEGORIES, PRIORITY_LEVELS, DEPARTMENTS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  Lock,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Edit,
  Save,
  X,
  RefreshCw,
  Building2,
  UserCheck,
  Eye,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Flame,
  Link as LinkIcon,
  FileCheck,
} from "lucide-react";
import Link from "next/link";


export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [secretInput, setSecretInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterEscalatedOnly, setFilterEscalatedOnly] = useState(false);

  // Escalation action state
  const [escalating, setEscalating] = useState(false);
  const [escalationNotice, setEscalationNotice] = useState<string | null>(null);
  const [seedingData, setSeedingData] = useState(false);

  // Selected complaint for editing status/department
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [editStatus, setEditStatus] = useState<ComplaintStatus>("Reported");
  const [editPriority, setEditPriority] = useState<PriorityLevel>("Medium");
  const [editDepartment, setEditDepartment] = useState("");
  const [editOfficer, setEditOfficer] = useState("");
  const [editAdminNotes, setEditAdminNotes] = useState("");
  const [editEscalationLevel, setEditEscalationLevel] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);

  // Duplicate Linking modal state
  const [linkingComplaint, setLinkingComplaint] = useState<Complaint | null>(null);
  const [selectedDuplicateIds, setSelectedDuplicateIds] = useState<string[]>([]);
  const [linkNotes, setLinkNotes] = useState("");
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [linkSuccessMessage, setLinkSuccessMessage] = useState<string | null>(null);

  // Resolution verification modal state
  const [verifyingComplaint, setVerifyingComplaint] = useState<Complaint | null>(null);


  // Check auth status on load
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      setAuthenticated(data.authenticated);
      if (data.authenticated) {
        loadAdminComplaints();
      }
    } catch {
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretInput }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAuthenticated(true);
        loadAdminComplaints();
      } else {
        setAuthError(data.error || "Invalid administrative secret");
      }
    } catch {
      setAuthError("Failed to authenticate with server");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setSecretInput("");
  };

  const loadAdminComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const res = await fetch("/api/complaints?limit=100");
      const data = await res.json();
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (err: unknown) {
      console.warn("Failed to load admin queue:", err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  // Run automated SLA escalation scan
  const handleRunAutoEscalation = async () => {
    setEscalating(true);
    setEscalationNotice(null);
    try {
      const res = await fetch("/api/admin/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoScanAllOverdue: true }),
      });
      const data = await res.json();
      if (data.success) {
        setEscalationNotice(
          `SLA Escalation Routine Completed: Evaluated ${data.scannedCount} complaints; escalated ${data.escalatedCount} overdue items.`
        );
        loadAdminComplaints();
      } else {
        setEscalationNotice(`Escalation error: ${data.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Escalation failed";
      setEscalationNotice(`Escalation error: ${msg}`);
    } finally {
      setEscalating(false);
    }
  };

  // Seed sample complaints for demo / evaluation
  const handleSeedSampleData = async () => {
    setSeedingData(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setEscalationNotice(`Sample data loaded: ${data.count} civic issues initialized.`);
        await loadAdminComplaints();
      } else {
        setEscalationNotice(`Failed to load sample data: ${data.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Seed failed";
      setEscalationNotice(`Seed error: ${msg}`);
    } finally {
      setSeedingData(false);
    }
  };

  const openEditModal = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setEditStatus(complaint.status);
    setEditPriority(complaint.priority);
    setEditDepartment(complaint.department);
    setEditOfficer(complaint.assignedOfficer || "");
    setEditAdminNotes(complaint.adminNotes || "");
    setEditEscalationLevel(complaint.escalationLevel || 0);
    setEditMessage(null);
  };

  const saveComplaintChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    setSavingEdit(true);
    setEditMessage(null);

    try {
      const res = await fetch(`/api/complaints/${editingComplaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          priority: editPriority,
          department: editDepartment,
          assignedOfficer: editOfficer || undefined,
          adminNotes: editAdminNotes,
          escalationLevel: editEscalationLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update complaint");
      }

      setEditMessage("Successfully saved changes.");
      // Refresh local state
      setComplaints((prev) =>
        prev.map((c) => (c.id === editingComplaint.id ? data.complaint : c))
      );
      setTimeout(() => {
        setEditingComplaint(null);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setEditMessage(`Error: ${msg}`);
    } finally {
      setSavingEdit(false);
    }
  };

  // Open duplicate linking modal
  const openLinkModal = (complaint: Complaint) => {
    setLinkingComplaint(complaint);
    // Auto-select duplicate candidates in the same category
    const candidates = complaints
      .filter((c) => c.id !== complaint.id && c.category === complaint.category && c.status !== "Resolved")
      .map((c) => c.id);
    setSelectedDuplicateIds(candidates.slice(0, 2));
    setLinkNotes(`Correlated civic reports merged under master incident.`);
    setLinkSuccessMessage(null);
  };

  const handleConfirmLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingComplaint || selectedDuplicateIds.length === 0) return;

    setLinkingLoading(true);
    try {
      const res = await fetch("/api/admin/incidents/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryComplaintId: linkingComplaint.id,
          duplicateComplaintIds: selectedDuplicateIds,
          notes: linkNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLinkSuccessMessage(data.message);
        loadAdminComplaints();
        setTimeout(() => setLinkingComplaint(null), 1200);
      }
    } catch (err: unknown) {
      console.warn("Link error:", err);
    } finally {
      setLinkingLoading(false);
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterCategory !== "All" && c.category !== filterCategory) return false;
    if (filterStatus !== "All" && c.status !== filterStatus) return false;
    if (filterPriority !== "All" && c.priority !== filterPriority) return false;
    if (filterEscalatedOnly && (c.escalationLevel || 0) === 0) return false;
    return true;
  });

  // Helper for Escalation Badge
  const renderEscalationBadge = (level: number) => {
    switch (level) {
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-200 text-red-950 border border-red-300 animate-pulse">
            <Flame className="w-3 h-3 text-red-700" />
            L3: Senior Authority
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-900 border border-red-200">
            L2: Municipal Admin
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-900 border border-orange-200">
            L1: Supervisor
          </span>
        );
      case 0:
      default:
        return (
          <span className="text-[10px] text-[#57534E] bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
            L0: Dept Queue
          </span>
        );
    }
  };

  // Login view if not authenticated
  if (authenticated === false || authenticated === null) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E6E1D6] p-8 shadow-warm-lg">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#1B4332] flex items-center justify-center mx-auto mb-3 text-white">
              <Lock className="w-6 h-6 text-[#C85A32]" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-[#1C1917]">
              Municipal Officer Portal
            </h1>
            <p className="text-xs text-[#57534E] mt-1">
              Authorized municipal administrators and field supervisors only.
            </p>
          </div>

          {authError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-secret"
                className="block text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-1.5"
              >
                Administrative Passkey
              </label>
              <input
                id="admin-secret"
                type="password"
                required
                placeholder="Enter ADMIN_SECRET..."
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              />
              <span className="text-[11px] text-[#57534E] mt-1 block">
                Default: <code className="bg-[#F3EFE8] px-1 py-0.5 rounded font-mono">CivicResolve2026!</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {authLoading ? "Authenticating..." : "Sign In to Operations Grid"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="bg-[#FFFFFF] border border-[#E6E1D6] rounded-2xl p-6 shadow-warm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFE8] text-xs font-semibold text-[#1B4332] mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Operations Control Room • Zone 1 to 15 Grid</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1C1917]">
              Municipal Triage & Work Order Queue
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] mt-1">
              Review AI recommendations, override priorities, reassign departments, link duplicate incidents, and run SLA escalations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Run Auto Escalation Button */}
            <button
              onClick={handleRunAutoEscalation}
              disabled={escalating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FDF2EC] hover:bg-[#FBE4D8] border border-[#F2D4C7] text-[#C85A32] rounded-xl text-xs font-bold transition-colors shadow-xs"
              title="Scan all open complaints and automatically escalate overdue items"
            >
              <TrendingUp className={`w-3.5 h-3.5 ${escalating ? "animate-spin" : ""}`} />
              <span>{escalating ? "Scanning SLAs..." : "Run SLA Auto-Escalation"}</span>
            </button>

            {/* Load Sample Civic Issues */}
            <button
              onClick={handleSeedSampleData}
              disabled={seedingData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F3EFE8] hover:bg-[#E6E1D6] border border-[#E6E1D6] text-[#1B4332] rounded-xl text-xs font-semibold transition-colors shadow-xs"
              title="Load 8 sample civic grievances"
            >
              <Layers className={`w-3.5 h-3.5 ${seedingData ? "animate-spin" : ""}`} />
              <span>{seedingData ? "Loading Samples..." : "Load Sample Civic Issues"}</span>
            </button>

            <button
              onClick={loadAdminComplaints}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F5] hover:bg-[#F3EFE8] border border-[#E6E1D6] rounded-xl text-xs font-semibold text-[#1C1917]"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingComplaints ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Escalation Notification Banner */}
        {escalationNotice && (
          <div className="bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl p-4 flex items-center justify-between text-xs text-[#1C1917]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{escalationNotice}</span>
            </div>
            <button
              onClick={() => setEscalationNotice(null)}
              className="text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white border border-[#E6E1D6] rounded-2xl p-4 shadow-warm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#57534E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, keyword, street, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-[#1C1917]"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Verification">Awaiting Verification</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-[#1C1917]"
            >
              <option value="All">All Priorities</option>
              {PRIORITY_LEVELS.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>

            <button
              onClick={() => setFilterEscalatedOnly(!filterEscalatedOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                filterEscalatedOnly
                  ? "bg-red-100 text-red-800 border-red-300"
                  : "bg-[#FAF8F5] text-stone-600 border-[#E6E1D6]"
              }`}
            >
              {filterEscalatedOnly ? "Showing Escalated" : "Filter Escalated"}
            </button>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white border border-[#E6E1D6] rounded-2xl shadow-warm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E6E1D6] text-[#57534E] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Tracking ID</th>
                  <th className="px-4 py-3">Grievance Title & Location</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Escalation</th>
                  <th className="px-4 py-3">SLA Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D6]">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-stone-500">
                      No complaints match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#1B4332] whitespace-nowrap">
                        <Link href={`/complaint/${item.id}`} className="hover:underline">
                          {item.id}
                        </Link>
                        {item.duplicateCount > 0 && (
                          <span className="block text-[10px] text-amber-700 font-sans">
                            +{item.duplicateCount} duplicate reports
                          </span>
                        )}
                        {item.incidentId && (
                          <span className="block font-mono text-[9px] text-[#C85A32]">
                            Incident: {item.incidentId}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-[#1C1917] truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#57534E] truncate">
                          {item.location}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[#1C1917]">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {renderEscalationBadge(item.escalationLevel || 0)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <SLAIndicator
                          priority={item.priority}
                          createdAt={item.createdAt}
                          slaDeadline={item.slaDeadline}
                          status={item.status}
                          resolvedAt={item.resolvedAt}
                        />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                        {/* Verify repair button */}
                        <button
                          onClick={() => setVerifyingComplaint(item)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold"
                          title="Upload after-repair evidence for AI verification"
                        >
                          <FileCheck className="w-3 h-3 text-emerald-700" />
                          <span>Verify</span>
                        </button>

                        {/* Link Incident button */}
                        <button
                          onClick={() => openLinkModal(item)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFE8] border border-[#E6E1D6] text-stone-700 text-xs font-medium"
                          title="Group with duplicate incident"
                        >
                          <LinkIcon className="w-3 h-3 text-[#C85A32]" />
                          <span>Link</span>
                        </button>

                        <button
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold transition-colors shadow-sm"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Manage</span>
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Editing Complaint */}
        {editingComplaint && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-[#E6E1D6] max-w-xl w-full p-6 shadow-warm-lg space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start pb-4 border-b border-[#E6E1D6]">
                <div>
                  <span className="font-mono text-xs font-bold text-[#1B4332]">
                    {editingComplaint.id}
                  </span>
                  <h3 className="font-heading font-bold text-lg text-[#1C1917]">
                    Manage Grievance Status & Escalation
                  </h3>
                </div>
                <button
                  onClick={() => setEditingComplaint(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    editMessage.startsWith("Error")
                      ? "bg-red-50 text-red-800 border border-red-200"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {editMessage}
                </div>
              )}

              <form onSubmit={saveComplaintChanges} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-[#57534E] mb-1">
                    Lifecycle Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ComplaintStatus)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl font-medium text-sm"
                  >
                    <option value="Reported">Reported</option>
                    <option value="In Progress">In Progress (Dispatched)</option>
                    <option value="Awaiting Verification">Awaiting Citizen/Auditor Verification</option>
                    <option value="Resolved">Resolved (Audited & Closed)</option>
                    <option value="Reopened">Reopened (Disputed Rework)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-[#57534E] mb-1">
                      Override Priority
                    </label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl font-medium text-sm"
                    >
                      {PRIORITY_LEVELS.map((p) => (
                        <option key={p} value={p}>
                          {p} Priority
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-[#57534E] mb-1">
                      Escalation Tier
                    </label>
                    <select
                      value={editEscalationLevel}
                      onChange={(e) => setEditEscalationLevel(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl font-medium text-sm"
                    >
                      <option value={0}>Level 0: Department Queue</option>
                      <option value={1}>Level 1: Department Supervisor</option>
                      <option value={2}>Level 2: Municipal Administrator</option>
                      <option value={3}>Level 3: Senior Authority</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-[#57534E] mb-1">
                      Assigned Department
                    </label>
                    <select
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl font-medium text-sm"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-[#57534E] mb-1">
                      Assigned Officer Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Er. K. Ramesh (AE)"
                      value={editOfficer}
                      onChange={(e) => setEditOfficer(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl font-medium text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-[#57534E] mb-1">
                    Administrative Progress / Work Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter inspection findings, repair progress, contractor details..."
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl text-sm"
                  />
                </div>

                <div className="pt-3 border-t border-[#E6E1D6] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingComplaint(null)}
                    className="px-4 py-2 rounded-xl border border-[#E6E1D6] text-stone-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-semibold shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingEdit ? "Saving..." : "Save Work Order"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Linking Duplicate Complaints */}
        {linkingComplaint && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-[#E6E1D6] max-w-lg w-full p-6 shadow-warm-lg space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-[#E6E1D6]">
                <div>
                  <span className="font-mono text-xs font-bold text-[#1B4332]">
                    Primary: {linkingComplaint.id}
                  </span>
                  <h3 className="font-heading font-bold text-lg text-[#1C1917]">
                    Group Shared Civic Incident
                  </h3>
                </div>
                <button
                  onClick={() => setLinkingComplaint(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {linkSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  {linkSuccessMessage}
                </div>
              )}

              <form onSubmit={handleConfirmLink} className="space-y-4 text-xs">
                <p className="text-[#57534E]">
                  Select related citizen complaints in the neighborhood to group under a single municipal work order without deleting citizen reports:
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl">
                  {complaints
                    .filter((c) => c.id !== linkingComplaint.id && c.status !== "Resolved")
                    .map((candidate) => {
                      const isChecked = selectedDuplicateIds.includes(candidate.id);
                      return (
                        <label
                          key={candidate.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E6E1D6] cursor-pointer hover:bg-stone-50"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDuplicateIds([...selectedDuplicateIds, candidate.id]);
                              } else {
                                setSelectedDuplicateIds(
                                  selectedDuplicateIds.filter((id) => id !== candidate.id)
                                );
                              }
                            }}
                            className="rounded text-[#1B4332] focus:ring-[#1B4332]"
                          />
                          <div className="flex-1 truncate">
                            <span className="font-mono font-bold text-[#1B4332] block">
                              {candidate.id} • {candidate.category}
                            </span>
                            <span className="text-[11px] text-stone-600 truncate block">
                              {candidate.title}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                </div>

                <div>
                  <label className="block font-bold uppercase text-[#57534E] mb-1">
                    Grouping Justification Notes
                  </label>
                  <input
                    type="text"
                    value={linkNotes}
                    onChange={(e) => setLinkNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E6E1D6] rounded-xl font-medium"
                  />
                </div>

                <div className="pt-2 border-t border-[#E6E1D6] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkingComplaint(null)}
                    className="px-4 py-2 rounded-xl border border-[#E6E1D6] text-stone-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={linkingLoading || selectedDuplicateIds.length === 0}
                    className="px-5 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B04A26] disabled:bg-stone-300 text-white font-semibold shadow-sm"
                  >
                    {linkingLoading ? "Linking Incident..." : "Confirm Grouping"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Resolution Verification */}
        {verifyingComplaint && (
          <ResolutionVerification
            complaint={verifyingComplaint}
            onSuccess={(updated) => {
              setComplaints((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c))
              );
            }}
            onClose={() => setVerifyingComplaint(null)}
          />
        )}
      </div>
    </div>
  );
}
