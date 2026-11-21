import { ComplaintStatus } from "@/lib/types";
import { CheckCircle2, Clock, Loader2, AlertOctagon, RotateCcw } from "lucide-react";

interface StatusStepperProps {
  currentStatus: ComplaintStatus;
}

const STEPS = [
  { id: "Reported", label: "Lodged & Triaged" },
  { id: "In Progress", label: "Field Crew Assigned" },
  { id: "Awaiting Verification", label: "Repair Verification" },
  { id: "Resolved", label: "Citizen Audit Closed" },
];

export function StatusStepper({ currentStatus }: StatusStepperProps) {
  const isReopened = currentStatus === "Reopened";

  const getStepIndex = (status: ComplaintStatus) => {
    switch (status) {
      case "Reported":
        return 0;
      case "In Progress":
        return 1;
      case "Awaiting Verification":
        return 2;
      case "Resolved":
        return 3;
      case "Reopened":
        return 1; // Put back at in progress / rework stage
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full py-4">
      {isReopened && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-800">
          <RotateCcw className="w-4 h-4 text-red-700 shrink-0" />
          <span>
            <strong>Grievance Reopened:</strong> Citizen disputed previous resolution evidence. Returned to active queue.
          </span>
        </div>
      )}

      <div className="relative flex justify-between items-center">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E6E1D6] -translate-y-1/2 z-0" />
        {/* Active progress line */}
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-[#1B4332] -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex || (idx === currentIndex && currentStatus === "Resolved");
          const isCurrent = idx === currentIndex && currentStatus !== "Resolved";

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
                  isCompleted
                    ? "bg-[#1B4332] border-[#1B4332] text-white"
                    : isCurrent
                    ? "bg-white border-[#C85A32] text-[#C85A32] ring-4 ring-[#FDF2EC]"
                    : "bg-white border-[#E6E1D6] text-[#57534E]"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32] animate-ping" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-[11px] font-medium mt-2 text-center max-w-[80px] sm:max-w-none ${
                  isCurrent
                    ? "text-[#C85A32] font-semibold"
                    : isCompleted
                    ? "text-[#1B4332]"
                    : "text-[#57534E]"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
