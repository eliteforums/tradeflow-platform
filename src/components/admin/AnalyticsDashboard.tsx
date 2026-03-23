import { useState } from "react";
import { useAnalyticsData, DateRange } from "@/hooks/useAnalyticsData";
import {
  Eye, Users, UserCheck, UserX, Monitor, Smartphone, Tablet, Cookie,
  TrendingUp, BarChart3, Loader2, Activity, Clock, Globe, Zap,
  ArrowUpRight, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid,
} from "recharts";
import { format } from "date-fns";

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
];

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [pageFilter, setPageFilter] = useState<string>("all");

  const data = useAnalyticsData(dateRange);

  if (data.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasData = data.viewsTotal > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold font-display">Site Analytics</h2>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {data.allPagePaths.length > 1 && (
            <Select value={pageFilter} onValueChange={setPageFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="All Pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                {data.allPagePaths.slice(0, 20).map((p: string) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-xl px-4 py-2 border border-border/30">
        ℹ️ Admin browsing activity is excluded. Data refreshes in realtime.
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: "Total Views", value: data.viewsTotal, icon: Eye, iconBg: "bg-primary/10", iconColor: "text-primary" },
          { label: "Unique Visitors", value: data.uniqueVisitors, icon: Users, iconBg: "bg-accent/10", iconColor: "text-accent" },
          { label: "Bounce Rate", value: `${data.bounceRate}%`, icon: ArrowUpRight, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
          { label: "Avg Duration", value: `${data.avgSessionDuration}m`, icon: Clock, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
          { label: "Live Now", value: data.liveNow, icon: Zap, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500", pulse: data.liveNow > 0 },
          { label: "Sessions", value: data.totalSessions, icon: Activity, iconBg: "bg-primary/10", iconColor: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors">
            <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center mb-2.5`}>
              <s.icon className={`w-4 h-4 ${s.iconColor}`} />
            </div>
            <p className="text-xl font-bold leading-none flex items-center gap-1.5">
              {s.value}
              {(s as any).pulse && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Visitor Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/50">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2.5">
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold leading-none">{data.uniqueUsers}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Logged-in Users</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/50">
          <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center mb-2.5">
            <UserX className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold leading-none">{data.uniqueAnonymous}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Anonymous Visitors</p>
        </div>
      </div>

      {!hasData && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No analytics data yet. Metrics will appear once real users start visiting.
        </div>
      )}

      {hasData && (
        <>
          {/* Daily Traffic Trend */}
          {data.dailyTrend.length > 1 && (
            <div className="rounded-2xl bg-card border border-border/50 p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Daily Traffic
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyTrend}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => format(new Date(v), "MMM d")}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      labelFormatter={(v) => format(new Date(v), "MMM d, yyyy")}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      fill="url(#colorViews)"
                      strokeWidth={2}
                      name="Views"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Pages */}
            <div className="rounded-2xl bg-card border border-border/50 p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Top Pages
              </h3>
              {data.topPages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
              ) : (
                <div className="space-y-2.5">
                  {data.topPages.map((p, i) => (
                    <div key={p.path} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-5 text-right font-mono">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium truncate">{p.path}</span>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[10px] text-muted-foreground">{p.uniqueSessions} visitors</span>
                            <span className="text-xs font-semibold">{p.count}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60 transition-all"
                            style={{ width: `${(p.count / (data.topPages[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hourly Traffic */}
            <div className="rounded-2xl bg-card border border-border/50 p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Hourly Traffic
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hourlyData}>
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => `${v}h`}
                      axisLine={false}
                      tickLine={false}
                      interval={3}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      labelFormatter={(v) => `${v}:00`}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      name="Views"
                      opacity={0.7}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Referrer Sources */}
            <div className="rounded-2xl bg-card border border-border/50 p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Traffic Sources
              </h3>
              {data.topReferrers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No referrer data</p>
              ) : (
                <div className="space-y-2">
                  {data.topReferrers.map((r) => (
                    <div key={r.source} className="flex items-center justify-between">
                      <span className="text-xs truncate max-w-[140px]">{r.source}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent/60"
                            style={{ width: `${(r.count / (data.topReferrers[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{r.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Device Breakdown */}
            <div className="rounded-2xl bg-card border border-border/50 p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" /> Devices
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(() => {
                  const total = data.deviceCounts.desktop + data.deviceCounts.tablet + data.deviceCounts.mobile || 1;
                  return [
                    { label: "Desktop", value: data.deviceCounts.desktop, icon: Monitor, pct: Math.round((data.deviceCounts.desktop / total) * 100) },
                    { label: "Tablet", value: data.deviceCounts.tablet, icon: Tablet, pct: Math.round((data.deviceCounts.tablet / total) * 100) },
                    { label: "Mobile", value: data.deviceCounts.mobile, icon: Smartphone, pct: Math.round((data.deviceCounts.mobile / total) * 100) },
                  ].map((d) => (
                    <div key={d.label} className="p-3 rounded-xl bg-muted/20 border border-border/30 text-center">
                      <d.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                      <p className="text-lg font-bold">{d.value}</p>
                      <p className="text-[10px] text-muted-foreground">{d.pct}%</p>
                      <p className="text-[9px] text-muted-foreground">{d.label}</p>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Cookie Consent Stats */}
            <div className="rounded-2xl bg-card border border-border/50 p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Cookie className="w-4 h-4 text-primary" /> Cookie Consent
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(() => {
                  const total = data.consentStats.accepted + data.consentStats.rejected + data.consentStats.pending || 1;
                  return [
                    { label: "Accepted", value: data.consentStats.accepted, color: "bg-emerald-500", pct: Math.round((data.consentStats.accepted / total) * 100) },
                    { label: "Rejected", value: data.consentStats.rejected, color: "bg-destructive", pct: Math.round((data.consentStats.rejected / total) * 100) },
                    { label: "Pending", value: data.consentStats.pending, color: "bg-amber-500", pct: Math.round((data.consentStats.pending / total) * 100) },
                  ].map((c) => (
                    <div key={c.label} className="p-3 rounded-xl bg-muted/20 border border-border/30 text-center">
                      <div className={`w-3 h-3 rounded-full ${c.color} mx-auto mb-1.5`} />
                      <p className="text-lg font-bold">{c.value}</p>
                      <p className="text-[10px] text-muted-foreground">{c.pct}%</p>
                      <p className="text-[9px] text-muted-foreground">{c.label}</p>
                    </div>
                  ));
                })()}
              </div>
              {(() => {
                const total = data.consentStats.accepted + data.consentStats.rejected + data.consentStats.pending;
                if (total === 0) return null;
                return (
                  <div className="flex h-2 rounded-full overflow-hidden mt-4 bg-muted">
                    <div className="bg-emerald-500" style={{ width: `${(data.consentStats.accepted / total) * 100}%` }} />
                    <div className="bg-destructive" style={{ width: `${(data.consentStats.rejected / total) * 100}%` }} />
                    <div className="bg-amber-500" style={{ width: `${(data.consentStats.pending / total) * 100}%` }} />
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
