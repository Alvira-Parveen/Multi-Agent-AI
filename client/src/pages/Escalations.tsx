import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, Cpu } from "lucide-react";
import { toast } from "sonner";

export default function Escalations() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedStatus, setSelectedStatus] = useState<"open" | "in_progress" | "resolved" | "all">("open");

  const { data: escalations, refetch } = trpc.escalations.list.useQuery();
  const updateStatusMutation = trpc.escalations.updateStatus.useMutation();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const filteredEscalations = escalations?.filter(e => {
    if (selectedStatus === "all") return true;
    return e.status === selectedStatus;
  }) || [];

  const handleStatusUpdate = async (escalationId: number, newStatus: "open" | "in_progress" | "resolved") => {
    try {
      await updateStatusMutation.mutateAsync({
        escalationId,
        status: newStatus,
      });
      toast.success("Escalation status updated");
      refetch();
    } catch (error) {
      toast.error("Failed to update escalation");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-amber-400" />;
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500/10 border-red-500/30";
      case "in_progress":
        return "bg-amber-500/10 border-amber-500/30";
      case "resolved":
        return "bg-emerald-500/10 border-emerald-500/30";
      default:
        return "bg-slate-700/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#222222] font-sans antialiased flex flex-col">
      {/* Auth Top Header */}
      <header className="h-20 border-b border-[#ebebeb] bg-white sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 cursor-pointer animate-fade-in" onClick={() => setLocation("/")}>
          <Cpu className="w-8 h-8 text-[#ff385c]" />
          <span className="font-bold text-xl text-[#ff385c] tracking-tight">SupportFlow</span>
        </div>

        {/* Dashboard Products (Services tab active since Escalations is a Service panel) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <span className="text-[#6a6a6a] hover:text-[#222222] pb-2 cursor-pointer transition-colors" onClick={() => setLocation("/")}>Homes</span>
          <span className="text-[#6a6a6a] hover:text-[#222222] pb-2 cursor-pointer transition-colors" onClick={() => setLocation("/")}>Experiences <span className="text-[8px] bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full font-bold ml-1">NEW</span></span>
          <span className="text-[#222222] border-b-2 border-[#ff385c] pb-2 cursor-pointer">Services <span className="text-[8px] bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full font-bold ml-1">NEW</span></span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-[#6a6a6a]">Logged in as: <strong className="text-[#222222]">{user?.name}</strong></span>
          <button
            onClick={() => setLocation("/")}
            className="text-xs font-semibold text-[#6a6a6a] border border-[#dddddd] px-3.5 py-2 rounded-lg hover:bg-[#f7f7f7] transition-all"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12 space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-[#f7f7f7] border border-[#dddddd] rounded-full transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-[#222222]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#222222]">Support Escalations</h1>
            <p className="text-xs text-[#6a6a6a]">Review, route, and resolve customer conversations escalated for human review</p>
          </div>
        </div>

        {/* Status Filter Tab Buttons */}
        <div className="flex gap-2.5 flex-wrap border-b border-[#ebebeb] pb-4 flex-shrink-0">
          {["open", "in_progress", "resolved", "all"].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as any)}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                selectedStatus === status
                  ? "bg-[#222222] text-white border-transparent shadow-sm"
                  : "border-[#dddddd] text-[#222222] hover:bg-[#f7f7f7]"
              }`}
            >
              {status === "in_progress"
                ? "In Progress"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Escalations List */}
        <div className="space-y-4">
          {filteredEscalations.length > 0 ? (
            filteredEscalations.map(escalation => (
              <Card
                key={escalation.id}
                className={`border p-6 rounded-xl transition-all ${
                  escalation.status === "open"
                    ? "bg-[#fff1f2]/40 border-red-200"
                    : escalation.status === "in_progress"
                    ? "bg-[#fffbeb]/40 border-amber-200"
                    : "bg-[#f0fdf4]/40 border-emerald-200"
                }`}
                style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 4px" }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1 flex-shrink-0">
                      {escalation.status === "open" ? (
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        </div>
                      ) : escalation.status === "in_progress" ? (
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-[#222222] mb-1 truncate">{escalation.reason}</h3>
                      {escalation.notes && (
                        <p className="text-[#6a6a6a] text-xs mb-3 font-medium leading-relaxed">{escalation.notes}</p>
                      )}
                      <div className="flex gap-4 text-[10px] text-[#6a6a6a] font-bold">
                        <span>CASE ID: #{escalation.id}</span>
                        <span>CREATED: {new Date(escalation.createdAt).toLocaleDateString()}</span>
                        {escalation.resolvedAt && (
                          <span className="text-emerald-700">RESOLVED: {new Date(escalation.resolvedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    {escalation.status !== "in_progress" && escalation.status !== "resolved" && (
                      <button
                        onClick={() => handleStatusUpdate(escalation.id, "in_progress")}
                        className="bg-amber-500 hover:bg-amber-600 active:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm"
                      >
                        In Progress
                      </button>
                    )}
                    {escalation.status !== "resolved" && (
                      <button
                        onClick={() => handleStatusUpdate(escalation.id, "resolved")}
                        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm"
                      >
                        Resolve Case
                      </button>
                    )}
                    {escalation.status === "resolved" && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="border border-[#dddddd] border-dashed bg-white p-16 text-center rounded-xl">
              <AlertTriangle className="w-12 h-12 text-[#dddddd] mx-auto mb-4" />
              <p className="text-sm font-semibold text-[#222222]">No support cases found</p>
              <p className="text-xs text-[#6a6a6a] mt-1">Select another status filter above to browse case history</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
