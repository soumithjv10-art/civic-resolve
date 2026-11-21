"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Complaint, PriorityLevel } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/utils";
import { ArrowUpRight, Flame, Layers } from "lucide-react";

interface CivicMapProps {
  complaints: Complaint[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: Complaint) => void;
  showHotspots?: boolean;
}

// Function to generate high-fidelity custom SVG DivIcons for Leaflet
function createCustomPin(priority: PriorityLevel, isHotspot = false): L.DivIcon {
  let color = "#059669"; // Low: Emerald
  let bgRgba = "rgba(5, 150, 105, 0.2)";
  let pulse = "";

  if (priority === "Critical") {
    color = "#DC2626"; // Red
    bgRgba = "rgba(220, 38, 38, 0.25)";
    pulse = '<div class="absolute -inset-1 rounded-full bg-red-500 animate-ping opacity-40"></div>';
  } else if (priority === "High") {
    color = "#EA580C"; // Orange
    bgRgba = "rgba(234, 88, 12, 0.2)";
  } else if (priority === "Medium") {
    color = "#D97706"; // Amber
    bgRgba = "rgba(217, 119, 6, 0.2)";
  }

  const svgHtml = `
    <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
      ${pulse}
      <div style="background-color: ${color}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);" class="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white transition-transform group-hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div style="border-top-color: ${color};" class="absolute -bottom-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px]"></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: "custom-leaflet-marker",
    iconSize: [32, 36],
    iconAnchor: [16, 36],
    popupAnchor: [0, -32],
  });
}

// Controller to auto-center map when a complaint is clicked
function MapViewController({ center }: { center?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function CivicMap({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  showHotspots = true,
}: CivicMapProps) {
  // Filter complaints that have valid coordinates
  const locatedComplaints = useMemo(() => {
    return complaints.filter(
      (c) =>
        c.coordinates &&
        typeof c.coordinates.lat === "number" &&
        typeof c.coordinates.lng === "number" &&
        !isNaN(c.coordinates.lat) &&
        !isNaN(c.coordinates.lng)
    );
  }, [complaints]);

  // Compute hotspot cluster centers (points with nearby complaints within 600m)
  const hotspots = useMemo(() => {
    if (!showHotspots) return [];

    const clusters: Array<{
      lat: number;
      lng: number;
      count: number;
      dominantCategory: string;
    }> = [];

    locatedComplaints.forEach((c) => {
      if (!c.coordinates) return;
      const existing = clusters.find((cluster) => {
        const dLat = Math.abs(cluster.lat - c.coordinates!.lat);
        const dLng = Math.abs(cluster.lng - c.coordinates!.lng);
        return dLat < 0.006 && dLng < 0.006; // Approx ~600m
      });

      if (existing) {
        existing.count += 1;
      } else {
        clusters.push({
          lat: c.coordinates.lat,
          lng: c.coordinates.lng,
          count: 1,
          dominantCategory: c.category,
        });
      }
    });

    return clusters.filter((cl) => cl.count >= 2);
  }, [locatedComplaints, showHotspots]);

  // Default center: average of located complaints or fallback to Chennai municipal center
  const defaultCenter: [number, number] = useMemo(() => {
    if (locatedComplaints.length > 0) {
      const avgLat =
        locatedComplaints.reduce((sum, c) => sum + c.coordinates!.lat, 0) /
        locatedComplaints.length;
      const avgLng =
        locatedComplaints.reduce((sum, c) => sum + c.coordinates!.lng, 0) /
        locatedComplaints.length;
      return [avgLat, avgLng];
    }
    return [13.0827, 80.2707];
  }, [locatedComplaints]);

  // Target center if selected complaint
  const activeCenter = useMemo((): [number, number] | undefined => {
    if (!selectedComplaintId) return undefined;
    const selected = locatedComplaints.find((c) => c.id === selectedComplaintId);
    if (selected && selected.coordinates) {
      return [selected.coordinates.lat, selected.coordinates.lng];
    }
    return undefined;
  }, [selectedComplaintId, locatedComplaints]);

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-[#E6E1D6] shadow-warm">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController center={activeCenter} />

        {/* Hotspot density circles */}
        {showHotspots &&
          hotspots.map((hotspot, idx) => (
            <Circle
              key={`hotspot-${idx}`}
              center={[hotspot.lat, hotspot.lng]}
              radius={400}
              pathOptions={{
                color: "#C85A32",
                fillColor: "#C85A32",
                fillOpacity: 0.18,
                weight: 1.5,
                dashArray: "4, 6",
              }}
            />
          ))}

        {/* Plot Complaint Markers */}
        {locatedComplaints.map((comp) => {
          const coords: [number, number] = [
            comp.coordinates!.lat,
            comp.coordinates!.lng,
          ];
          const pinIcon = createCustomPin(comp.priority);

          return (
            <Marker
              key={comp.id}
              position={coords}
              icon={pinIcon}
              eventHandlers={{
                click: () => onSelectComplaint?.(comp),
              }}
            >
              <Popup className="civic-custom-popup" maxWidth={320}>
                <div className="p-3 text-left space-y-2 font-sans">
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-2">
                    <span className="font-mono text-[11px] font-bold text-[#1B4332] bg-[#F3EFE8] px-2 py-0.5 rounded">
                      {comp.id}
                    </span>
                    <PriorityBadge priority={comp.priority} showIcon={false} />
                  </div>

                  {/* Title */}
                  <h4 className="font-heading font-bold text-sm text-[#1C1917] leading-snug">
                    {comp.title}
                  </h4>

                  {/* Location & Status */}
                  <div className="flex items-center justify-between text-xs text-[#57534E]">
                    <span className="truncate max-w-[160px]">{comp.location}</span>
                    <StatusBadge status={comp.status} showIcon={false} />
                  </div>

                  {/* AI Summary */}
                  <p className="text-xs text-[#57534E] line-clamp-2 bg-[#FAF8F5] p-2 rounded border border-[#E6E1D6]">
                    {comp.aiSummary}
                  </p>

                  {/* CTA */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-[#57534E]">
                      {comp.upvotes} Citizens upvoted
                    </span>
                    <Link
                      href={`/complaint/${comp.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] hover:underline"
                    >
                      <span>Full Audit</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-sm border border-[#E6E1D6] rounded-xl p-3 shadow-warm-md text-xs space-y-1.5 hidden sm:block">
        <span className="font-heading font-bold text-[#1C1917] block mb-1">
          Priority Map Legend
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          <span className="text-[#57534E]">Critical Priority (4h SLA)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span className="text-[#57534E]">High Priority (24h SLA)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-[#57534E]">Medium Priority (72h SLA)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span className="text-[#57534E]">Low Priority (7d SLA)</span>
        </div>
        {showHotspots && (
          <div className="flex items-center gap-2 pt-1 border-t border-stone-200">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#C85A32] bg-[#FDF2EC]"></span>
            <span className="text-[#C85A32] font-semibold">Civic Hotspot (2+ Reports)</span>
          </div>
        )}
      </div>
    </div>
  );
}
