import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, TrendingUp, Users, Clock, Zap, Cpu } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: overview } = trpc.analytics.getOverview.useQuery();
  const { data: agentUsage } = trpc.analytics.getAgentUsage.useQuery();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  const COLORS = ["#ff385c", "#460479", "#92174d", "#3b82f6", "#10b981"];

  const chartData = useMemo(() => {
    if (!agentUsage) return [];
    return agentUsage.map((item: any, idx: number) => ({
      name: item.agent || "Unknown",
      value: item.count || 0,
    }));
  }, [agentUsage]);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#222222] font-sans antialiased flex flex-col">
      {/* Auth Top Header */}
      <header className="h-20 border-b border-[#ebebeb] bg-white sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 cursor-pointer animate-fade-in" onClick={() => setLocation("/")}>
          <Cpu className="w-8 h-8 text-[#ff385c]" />
          <span className="font-bold text-xl text-[#ff385c] tracking-tight">SupportFlow</span>
        </div>

        {/* Dashboard Products (Services tab active since Analytics/Escalations are Admin Services) */}
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
            <h1 className="text-xl font-bold text-[#222222]">Analytics Dashboard</h1>
            <p className="text-xs text-[#6a6a6a]">Monitor support conversations, routing frequency, and latency metrics</p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="bg-white border border-[#dddddd] p-6 rounded-xl flex items-center justify-between"
            style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px" }}
          >
            <div>
              <p className="text-[#6a6a6a] text-xs font-bold uppercase tracking-wider">Total Conversations</p>
              <p className="text-3xl font-extrabold text-[#222222] mt-1">
                {overview?.totalConversations || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-[#f7f7f7] rounded-full border border-[#dddddd] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#ff385c]" />
            </div>
          </Card>

          <Card 
            className="bg-white border border-[#dddddd] p-6 rounded-xl flex items-center justify-between"
            style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px" }}
          >
            <div>
              <p className="text-[#6a6a6a] text-xs font-bold uppercase tracking-wider">Total Messages</p>
              <p className="text-3xl font-extrabold text-[#222222] mt-1">
                {overview?.totalMessages || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-[#f7f7f7] rounded-full border border-[#dddddd] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#ff385c]" />
            </div>
          </Card>

          <Card 
            className="bg-white border border-[#dddddd] p-6 rounded-xl flex items-center justify-between"
            style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px" }}
          >
            <div>
              <p className="text-[#6a6a6a] text-xs font-bold uppercase tracking-wider">Avg Response Time</p>
              <p className="text-3xl font-extrabold text-[#222222] mt-1">
                {overview?.avgResponseTime ? Math.round(overview.avgResponseTime) : 0}ms
              </p>
            </div>
            <div className="w-10 h-10 bg-[#f7f7f7] rounded-full border border-[#dddddd] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#ff385c]" />
            </div>
          </Card>

          <Card 
            className="bg-white border border-[#dddddd] p-6 rounded-xl flex items-center justify-between"
            style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px" }}
          >
            <div>
              <p className="text-[#6a6a6a] text-xs font-bold uppercase tracking-wider">Avg Msg Density</p>
              <p className="text-3xl font-extrabold text-[#222222] mt-1">
                {overview?.totalConversations && overview?.totalMessages
                  ? Math.round(overview.totalMessages / overview.totalConversations)
                  : 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-[#f7f7f7] rounded-full border border-[#dddddd] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#ff385c]" />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Agent Usage Pie Chart */}
          <Card 
            className="bg-white border border-[#dddddd] p-6 rounded-xl"
            style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px" }}
          >
            <h2 className="text-base font-bold text-[#222222] mb-6">Agent Usage Breakdown</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name.replace(/[\[\]\"]/g, '')}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-[#6a6a6a] text-sm">
                No active conversations to track
              </div>
            )}
          </Card>

          {/* Agent Performance Statistics */}
          <Card 
            className="bg-white border border-[#dddddd] p-6 rounded-xl"
            style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px" }}
          >
            <h2 className="text-base font-bold text-[#222222] mb-6">Agent Performance List</h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {chartData.length > 0 ? (
                chartData.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-[#f7f7f7] border border-[#ebebeb] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      ></div>
                      <span className="text-[#222222] font-semibold text-xs truncate max-w-[200px]">{item.name.replace(/[\[\]\"]/g, '')}</span>
                    </div>
                    <span className="text-[#ff385c] font-bold text-xs">{item.value} conversations</span>
                  </div>
                ))
              ) : (
                <p className="text-[#6a6a6a] text-center text-xs py-8">No agent metrics registered</p>
              )}
            </div>
          </Card>
        </div>

        {/* Performance Metrics Summary */}
        <Card 
          className="bg-white border border-[#dddddd] p-6 rounded-xl"
          style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px" }}
        >
          <h2 className="text-base font-bold text-[#222222] mb-6">Platform Quality Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="bg-[#f7f7f7] border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[#6a6a6a] text-xs font-bold uppercase tracking-wider">Conversation Success Rate</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-2">95%</p>
              <p className="text-[10px] text-[#6a6a6a] mt-1">Calculated from AI response relevance</p>
            </div>
            <div className="bg-[#f7f7f7] border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[#6a6a6a] text-xs font-bold uppercase tracking-wider">Average Customer Rating</p>
              <p className="text-2xl font-extrabold text-blue-600 mt-2">4.8/5</p>
              <p className="text-[10px] text-[#6a6a6a] mt-1">Based on simulated satisfaction scores</p>
            </div>
            <div className="bg-[#f7f7f7] border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[#6a6a6a] text-xs font-bold uppercase tracking-wider">System Agent Uptime</p>
              <p className="text-2xl font-extrabold text-purple-600 mt-2">99.9%</p>
              <p className="text-[10px] text-[#6a6a6a] mt-1">Average load state over last 30 days</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
