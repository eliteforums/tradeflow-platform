import { useState, useCallback } from "react";
import { useAnalyticsData, DateRange } from "@/hooks/useAnalyticsData";
import {
  Eye, Users, UserCheck, UserX, Monitor, Smartphone, Tablet, Cookie,
  TrendingUp, TrendingDown, BarChart3, Loader2, Activity, Clock, Globe, Zap,
  ArrowUpRight, ArrowDownRight, LogIn, LogOut, Layers, RefreshCw, Chrome,
  FileText, Hash, Download,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
];

const CHART_COLORS = [
  "hsl(243, 100%, 69%)",
  "hsl(12, 94%, 68%)",
  "hsl(142, 71%, 45%)",
  "hsl(41, 100%, 67%)",
  "hsl(0, 84%, 60%)",
  "hsl(200, 80%, 55%)",
  "hsl(320, 60%, 55%)",
  "hsl(50, 80%, 55%)",
];

const TOOLTIP_STYLE = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  fontSize: "11px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// --- Reusable sub-components ---

function KPICard({ label, value, icon: Icon, sub, color, gradient, pulse, alert }: any) {
  return (
    <div className={`relative overflow-hidden p-4 rounded-xl bg-gradient-to-br ${gradient} bg-card border border-border/40 hover:border-border/80 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-4 h-4 ${color} opacity-70`} />
        {pulse && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
        )}
        {alert && <ArrowDownRight className="w-3 h-3 text-amber-500" />}
      </div>
      <p className="text-2xl font-bold tracking-tight leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/30">
            {columns.map(c => (
              <th key={c} className="text-left py-2 px-2 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/10 hover:bg-muted/5 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`py-1.5 px-2 ${j === 0 ? 'font-mono text-foreground' : 'text-muted-foreground'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DonutChart({ data: chartData, total, centerLabel, colors }: { data: { name: string; value: number }[]; total: number; centerLabel: string; colors?: string[] }) {
  const usedColors = colors || CHART_COLORS;
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
            {chartData.map((_, i) => <Cell key={i} fill={usedColors[i % usedColors.length]} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val: number, name: string) => [`${val} (${total > 0 ? Math.round((val / total) * 100) : 0}%)`, name]} />
          <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: 20, fontWeight: 800 }}>{total}</text>
          <text x="50%" y="57%" textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>{centerLabel}</text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, className = "" }: any) {
  return (
    <div className={`rounded-xl bg-card border border-border/40 p-5 ${className}`}>
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" /> {title}
      </h3>
      {children}
    </div>
  );
}

// --- Main Dashboard ---

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
  const deviceTotal = data.deviceCounts.desktop + data.deviceCounts.tablet + data.deviceCounts.mobile;
  const deviceDonut = [
    { name: "Desktop", value: data.deviceCounts.desktop },
    { name: "Tablet", value: data.deviceCounts.tablet },
    { name: "Mobile", value: data.deviceCounts.mobile },
  ].filter(d => d.value > 0);
  const consentTotal = data.consentStats.accepted + data.consentStats.rejected + data.consentStats.pending;
  const consentDonut = [
    { name: "Accepted", value: data.consentStats.accepted, color: "hsl(142, 71%, 45%)" },
    { name: "Rejected", value: data.consentStats.rejected, color: "hsl(0, 84%, 60%)" },
    { name: "Pending", value: data.consentStats.pending, color: "hsl(38, 92%, 50%)" },
  ].filter(d => d.value > 0);
  const referrerDonut = data.topReferrers.slice(0, 6).map((r, i) => ({
    name: r.source.length > 16 ? r.source.slice(0, 14) + "…" : r.source,
    fullName: r.source,
    value: r.count,
  }));
  const hourlyMax = Math.max(...data.hourlyData.map(h => h.count), 1);
  const newRetDonut = [
    { name: "New", value: data.newVisitors },
    { name: "Returning", value: data.returningVisitors },
  ].filter(d => d.value > 0);
  const newRetTotal = data.newVisitors + data.returningVisitors;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold font-display tracking-tight">Site Analytics</h2>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
          {data.liveNow > 0 && (
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{data.liveNow}</span> active now
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[120px] h-8 text-xs bg-card border-border/50">
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
              <SelectTrigger className="w-[160px] h-8 text-xs bg-card border-border/50">
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

      {/* KPI Hero Strip — 8 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <KPICard label="Total Views" value={data.viewsTotal.toLocaleString()} icon={Eye} sub={`${data.viewsToday} today`} color="text-primary" gradient="from-primary/5 to-transparent" />
        <KPICard label="Unique Visitors" value={data.uniqueVisitors.toLocaleString()} icon={Users} sub={`${data.uniqueUsers} logged in`} color="text-accent" gradient="from-accent/5 to-transparent" />
        <KPICard label="Sessions" value={data.totalSessions.toLocaleString()} icon={Activity} sub={`${data.viewsWeek} views/wk`} color="text-primary" gradient="from-primary/5 to-transparent" />
        <KPICard label="Bounce Rate" value={`${data.bounceRate}%`} icon={ArrowUpRight} sub={`${data.totalSessions} sessions`} color="text-amber-500" gradient="from-amber-500/5 to-transparent" alert={data.bounceRate > 70} />
        <KPICard label="Avg Duration" value={`${data.avgSessionDuration}m`} icon={Clock} sub="per session" color="text-emerald-500" gradient="from-emerald-500/5 to-transparent" />
        <KPICard label="Pages/Session" value={data.pagesPerSession} icon={Layers} sub="avg depth" color="text-blue-500" gradient="from-blue-500/5 to-transparent" />
        <KPICard label="Growth" value={`${data.growthRate > 0 ? '+' : ''}${data.growthRate}%`} icon={data.growthRate >= 0 ? TrendingUp : TrendingDown} sub="vs prev period" color={data.growthRate >= 0 ? "text-emerald-500" : "text-red-500"} gradient={data.growthRate >= 0 ? "from-emerald-500/5 to-transparent" : "from-red-500/5 to-transparent"} />
        <KPICard label="Live Now" value={data.liveNow} icon={Zap} sub="active sessions" color="text-emerald-400" gradient="from-emerald-400/5 to-transparent" pulse={data.liveNow > 0} />
      </div>

      {/* Visitor Segmentation Bar */}
      <div className="rounded-xl bg-card border border-border/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visitor Segmentation</h3>
          <span className="text-xs text-muted-foreground">{data.uniqueVisitors} total</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-muted/30">
          {data.uniqueUsers > 0 && (
            <div className="h-full transition-all duration-500" style={{ width: `${(data.uniqueUsers / (data.uniqueVisitors || 1)) * 100}%`, background: CHART_COLORS[0] }} />
          )}
          {data.uniqueAnonymous > 0 && (
            <div className="h-full transition-all duration-500" style={{ width: `${(data.uniqueAnonymous / (data.uniqueVisitors || 1)) * 100}%`, background: CHART_COLORS[1] }} />
          )}
        </div>
        <div className="flex items-center gap-6 mt-2.5">
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold">{data.uniqueUsers}</span>
            <span className="text-[10px] text-muted-foreground">Authenticated ({data.uniqueVisitors > 0 ? Math.round((data.uniqueUsers / data.uniqueVisitors) * 100) : 0}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <UserX className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold">{data.uniqueAnonymous}</span>
            <span className="text-[10px] text-muted-foreground">Anonymous ({data.uniqueVisitors > 0 ? Math.round((data.uniqueAnonymous / data.uniqueVisitors) * 100) : 0}%)</span>
          </div>
        </div>
      </div>

      {!hasData && (
        <div className="text-center py-12 text-muted-foreground text-sm rounded-xl bg-card border border-border/40">
          No analytics data yet. Metrics will appear once real users start visiting.
        </div>
      )}

      {hasData && (
        <>
          {/* Daily Traffic — Stacked Area */}
          {data.dailyTrend.length > 1 && (
            <div className="rounded-xl bg-card border border-border/40 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Daily Traffic
                </h3>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: CHART_COLORS[0] }} /> Authenticated</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: CHART_COLORS[1] }} /> Anonymous</span>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyTrend}>
                    <defs>
                      <linearGradient id="gradAuth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradAnon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => format(new Date(v), "MMM d")} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => format(new Date(v), "MMM d, yyyy")} />
                    <Area type="monotone" dataKey="authenticated" stackId="1" stroke={CHART_COLORS[0]} fill="url(#gradAuth)" strokeWidth={2} name="Authenticated" />
                    <Area type="monotone" dataKey="anonymous" stackId="1" stroke={CHART_COLORS[1]} fill="url(#gradAnon)" strokeWidth={2} name="Anonymous" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tabbed Section: Pages */}
          <SectionCard title="Page Analytics" icon={FileText}>
            <Tabs defaultValue="top" className="w-full">
              <TabsList className="mb-3">
                <TabsTrigger value="top" className="text-xs">Top Pages</TabsTrigger>
                <TabsTrigger value="entry" className="text-xs">Entry Pages</TabsTrigger>
                <TabsTrigger value="exit" className="text-xs">Exit Pages</TabsTrigger>
              </TabsList>
              <TabsContent value="top">
                {data.topPages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.topPages.slice(0, 10)} layout="vertical" margin={{ left: 0, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="path" width={120} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: string) => v.length > 20 ? v.slice(0, 18) + "…" : v} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val: number) => [`${val} views`, "Views"]} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} name="Views" barSize={16}>
                          {data.topPages.slice(0, 10).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.85} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {data.topPages.length > 0 && (
                  <div className="mt-3">
                    <DataTable
                      columns={["Page", "Views", "Sessions", "Views/Session"]}
                      rows={data.topPages.slice(0, 10).map(p => [
                        p.path,
                        p.count.toLocaleString(),
                        p.uniqueSessions.toLocaleString(),
                        p.uniqueSessions > 0 ? (p.count / p.uniqueSessions).toFixed(1) : "—",
                      ])}
                    />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="entry">
                <DataTable
                  columns={["Landing Page", "Entries"]}
                  rows={data.topEntryPages.map(p => [p.path, p.count.toLocaleString()])}
                />
              </TabsContent>
              <TabsContent value="exit">
                <DataTable
                  columns={["Exit Page", "Exits"]}
                  rows={data.topExitPages.map(p => [p.path, p.count.toLocaleString()])}
                />
              </TabsContent>
            </Tabs>
          </SectionCard>

          {/* Row: Hourly + Day of Week */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Hourly Traffic Distribution" icon={Clock}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}h`} axisLine={false} tickLine={false} interval={2} />
                    <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={25} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => `${v}:00 — ${(v as number) + 1}:00`} />
                    <Bar dataKey="count" name="Views" radius={[4, 4, 0, 0]} barSize={14}>
                      {data.hourlyData.map((entry, i) => {
                        const intensity = entry.count / hourlyMax;
                        return <Cell key={i} fill={`hsl(243, 100%, ${69 - intensity * 15}%)`} opacity={0.3 + intensity * 0.7} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Day of Week Traffic" icon={BarChart3}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dayOfWeekCounts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => DAY_NAMES[v]} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => DAY_NAMES[v as number]} />
                    <Bar dataKey="count" name="Views" radius={[6, 6, 0, 0]} barSize={28}>
                      {data.dayOfWeekCounts.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.8} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          {/* Row: 4 donuts — Devices, New/Returning, Sources, Consent */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Device Breakdown */}
            <SectionCard title="Devices" icon={Monitor}>
              {deviceTotal === 0 ? <p className="text-sm text-muted-foreground text-center py-10">No data</p> : (
                <div className="flex flex-col items-center">
                  <DonutChart data={deviceDonut} total={deviceTotal} centerLabel="views" />
                  <div className="flex items-center gap-3 mt-1">
                    {[
                      { icon: Monitor, label: "Desktop", val: data.deviceCounts.desktop, i: 0 },
                      { icon: Tablet, label: "Tablet", val: data.deviceCounts.tablet, i: 1 },
                      { icon: Smartphone, label: "Mobile", val: data.deviceCounts.mobile, i: 2 },
                    ].map(d => (
                      <div key={d.label} className="flex items-center gap-1.5 text-[10px]">
                        <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[d.i] }} />
                        <span className="text-muted-foreground">{d.label}</span>
                        <span className="font-semibold">{d.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* New vs Returning */}
            <SectionCard title="New vs Returning" icon={RefreshCw}>
              {newRetTotal === 0 ? <p className="text-sm text-muted-foreground text-center py-10">No data</p> : (
                <div className="flex flex-col items-center">
                  <DonutChart data={newRetDonut} total={newRetTotal} centerLabel="visitors" colors={["hsl(200, 80%, 55%)", "hsl(142, 71%, 45%)"]} />
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-2 h-2 rounded-full" style={{ background: "hsl(200, 80%, 55%)" }} />
                      <span className="text-muted-foreground">New</span>
                      <span className="font-semibold">{data.newVisitors}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-2 h-2 rounded-full" style={{ background: "hsl(142, 71%, 45%)" }} />
                      <span className="text-muted-foreground">Returning</span>
                      <span className="font-semibold">{data.returningVisitors}</span>
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Traffic Sources */}
            <SectionCard title="Traffic Sources" icon={Globe}>
              {referrerDonut.length === 0 ? <p className="text-sm text-muted-foreground text-center py-10">No referrer data</p> : (
                <div className="flex flex-col items-center">
                  <DonutChart data={referrerDonut} total={data.topReferrers.reduce((s, r) => s + r.count, 0)} centerLabel="visits" />
                  <div className="w-full space-y-1 mt-1">
                    {referrerDonut.map((r, i) => (
                      <div key={r.name} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="truncate text-muted-foreground">{r.name}</span>
                        </div>
                        <span className="font-semibold ml-2">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Cookie Consent */}
            <SectionCard title="Cookie Consent" icon={Cookie}>
              {consentTotal === 0 ? <p className="text-sm text-muted-foreground text-center py-10">No data</p> : (
                <div className="flex flex-col items-center">
                  <DonutChart data={consentDonut} total={consentTotal} centerLabel="users" colors={consentDonut.map(c => c.color)} />
                  <div className="flex items-center gap-3 mt-1">
                    {consentDonut.map(c => (
                      <div key={c.name} className="flex items-center gap-1.5 text-[10px]">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                        <span className="text-muted-foreground">{c.name}</span>
                        <span className="font-semibold">{c.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-full flex h-2 rounded-full overflow-hidden mt-3 bg-muted/20">
                    {consentDonut.map(c => (
                      <div key={c.name} style={{ width: `${(c.value / consentTotal) * 100}%`, background: c.color }} className="h-full transition-all duration-500" />
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Row: Browser + OS + Screen Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SectionCard title="Browsers" icon={Chrome}>
              {data.browserBreakdown.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No data</p> : (
                <>
                  <DonutChart data={data.browserBreakdown.map(b => ({ name: b.name, value: b.count }))} total={data.viewsTotal} centerLabel="views" />
                  <div className="space-y-1 mt-2">
                    {data.browserBreakdown.map((b, i) => (
                      <div key={b.name} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-muted-foreground">{b.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{b.count.toLocaleString()}</span>
                          <span className="text-muted-foreground/60">{data.viewsTotal > 0 ? Math.round((b.count / data.viewsTotal) * 100) : 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </SectionCard>

            <SectionCard title="Operating Systems" icon={Monitor}>
              {data.osBreakdown.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No data</p> : (
                <>
                  <DonutChart data={data.osBreakdown.map(o => ({ name: o.name, value: o.count }))} total={data.viewsTotal} centerLabel="views" colors={CHART_COLORS.slice(2)} />
                  <div className="space-y-1 mt-2">
                    {data.osBreakdown.map((o, i) => (
                      <div key={o.name} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[(i + 2) % CHART_COLORS.length] }} />
                          <span className="text-muted-foreground">{o.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{o.count.toLocaleString()}</span>
                          <span className="text-muted-foreground/60">{data.viewsTotal > 0 ? Math.round((o.count / data.viewsTotal) * 100) : 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </SectionCard>

            <SectionCard title="Screen Resolutions" icon={Hash}>
              {data.topScreenSizes.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No data</p> : (
                <DataTable
                  columns={["Resolution", "Views", "%"]}
                  rows={data.topScreenSizes.map(s => [
                    s.size,
                    s.count.toLocaleString(),
                    `${data.viewsTotal > 0 ? Math.round((s.count / data.viewsTotal) * 100) : 0}%`,
                  ])}
                />
              )}
            </SectionCard>
          </div>

          {/* Full referrer table */}
          {data.topReferrers.length > 0 && (
            <SectionCard title="All Traffic Sources" icon={Globe}>
              <DataTable
                columns={["Source", "Visits", "% of Traffic"]}
                rows={data.topReferrers.map(r => [
                  r.source,
                  r.count.toLocaleString(),
                  `${data.viewsTotal > 0 ? Math.round((r.count / data.viewsTotal) * 100) : 0}%`,
                ])}
              />
            </SectionCard>
          )}

          {/* Info footer */}
          <div className="text-[10px] text-muted-foreground/50 text-center py-2">
            ℹ️ Admin browsing activity is excluded • Data refreshes in realtime • All events fetched (no 1k cap)
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
