import { useState } from "react";
import { useAnalyticsData, DateRange } from "@/hooks/useAnalyticsData";
import {
  Eye, Users, UserCheck, UserX, Monitor, Smartphone, Tablet, Cookie,
  TrendingUp, BarChart3, Loader2, Activity, Clock, Globe, Zap,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { format } from "date-fns";

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
];

const CHART_COLORS = [
  "hsl(243, 100%, 69%)", // purple/primary
  "hsl(12, 94%, 68%)",   // coral/secondary
  "hsl(142, 71%, 45%)",  // green
  "hsl(41, 100%, 67%)",  // golden
  "hsl(0, 84%, 60%)",    // red
  "hsl(200, 80%, 55%)",  // blue
  "hsl(320, 60%, 55%)",  // pink
  "hsl(50, 80%, 55%)",   // yellow
];

const TOOLTIP_STYLE = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  fontSize: "11px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
};

const renderDonutLabel = ({ cx, cy, value, total }: { cx: number; cy: number; value: number; total: number }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: 18, fontWeight: 700 }}>
    {total}
  </text>
);

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

  // Device donut data
  const deviceTotal = data.deviceCounts.desktop + data.deviceCounts.tablet + data.deviceCounts.mobile;
  const deviceDonut = [
    { name: "Desktop", value: data.deviceCounts.desktop },
    { name: "Tablet", value: data.deviceCounts.tablet },
    { name: "Mobile", value: data.deviceCounts.mobile },
  ].filter(d => d.value > 0);

  // Cookie consent donut data
  const consentTotal = data.consentStats.accepted + data.consentStats.rejected + data.consentStats.pending;
  const consentDonut = [
    { name: "Accepted", value: data.consentStats.accepted, color: "hsl(142, 71%, 45%)" },
    { name: "Rejected", value: data.consentStats.rejected, color: "hsl(0, 84%, 60%)" },
    { name: "Pending", value: data.consentStats.pending, color: "hsl(38, 92%, 50%)" },
  ].filter(d => d.value > 0);

  // Traffic sources donut
  const referrerDonut = data.topReferrers.slice(0, 6).map((r, i) => ({
    name: r.source.length > 16 ? r.source.slice(0, 14) + "…" : r.source,
    fullName: r.source,
    value: r.count,
  }));

  // Hourly max for color intensity
  const hourlyMax = Math.max(...data.hourlyData.map(h => h.count), 1);

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

      {/* KPI Hero Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          {
            label: "Total Views", value: data.viewsTotal, icon: Eye,
            sub: `${data.viewsToday} today`, color: "text-primary",
            gradient: "from-primary/5 to-transparent",
          },
          {
            label: "Unique Visitors", value: data.uniqueVisitors, icon: Users,
            sub: `${data.uniqueUsers} logged in`, color: "text-accent",
            gradient: "from-accent/5 to-transparent",
          },
          {
            label: "Bounce Rate", value: `${data.bounceRate}%`, icon: ArrowUpRight,
            sub: `${data.totalSessions} sessions`, color: "text-amber-500",
            gradient: "from-amber-500/5 to-transparent",
            alert: data.bounceRate > 70,
          },
          {
            label: "Avg Duration", value: `${data.avgSessionDuration}m`, icon: Clock,
            sub: "per session", color: "text-emerald-500",
            gradient: "from-emerald-500/5 to-transparent",
          },
          {
            label: "Live Now", value: data.liveNow, icon: Zap,
            sub: "active sessions", color: "text-emerald-400",
            gradient: "from-emerald-400/5 to-transparent",
            pulse: data.liveNow > 0,
          },
          {
            label: "Sessions", value: data.totalSessions, icon: Activity,
            sub: `${data.viewsWeek} views/wk`, color: "text-primary",
            gradient: "from-primary/5 to-transparent",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`relative overflow-hidden p-4 rounded-xl bg-gradient-to-br ${s.gradient} bg-card border border-border/40 hover:border-border/80 transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between mb-3">
              <s.icon className={`w-4 h-4 ${s.color} opacity-70`} />
              {(s as any).pulse && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
              )}
              {(s as any).alert && (
                <ArrowDownRight className="w-3 h-3 text-amber-500" />
              )}
            </div>
            <p className="text-2xl font-bold tracking-tight leading-none">{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">{s.label}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Visitor Segmentation Bar */}
      <div className="rounded-xl bg-card border border-border/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visitor Segmentation</h3>
          <span className="text-xs text-muted-foreground">{data.uniqueVisitors} total</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-muted/30">
          {data.uniqueUsers > 0 && (
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(data.uniqueUsers / (data.uniqueVisitors || 1)) * 100}%`,
                background: "hsl(243, 100%, 69%)",
              }}
            />
          )}
          {data.uniqueAnonymous > 0 && (
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(data.uniqueAnonymous / (data.uniqueVisitors || 1)) * 100}%`,
                background: "hsl(12, 94%, 68%)",
              }}
            />
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
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "hsl(243, 100%, 69%)" }} /> Authenticated</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "hsl(12, 94%, 68%)" }} /> Anonymous</span>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyTrend}>
                    <defs>
                      <linearGradient id="gradAuth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradAnon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(262, 52%, 60%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(262, 52%, 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => format(new Date(v), "MMM d")}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false} tickLine={false} width={30}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => format(new Date(v), "MMM d, yyyy")} />
                    <Area type="monotone" dataKey="authenticated" stackId="1" stroke="hsl(174, 62%, 47%)" fill="url(#gradAuth)" strokeWidth={2} name="Authenticated" />
                    <Area type="monotone" dataKey="anonymous" stackId="1" stroke="hsl(262, 52%, 60%)" fill="url(#gradAnon)" strokeWidth={2} name="Anonymous" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Row 3: Top Pages + Hourly Traffic */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Pages — Horizontal Bar Chart */}
            <div className="rounded-xl bg-card border border-border/40 p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Top Pages
              </h3>
              {data.topPages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topPages.slice(0, 8)} layout="vertical" margin={{ left: 0, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category" dataKey="path" width={100}
                        tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 16) + "…" : v}
                        axisLine={false} tickLine={false}
                      />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val: number) => [`${val} views`, "Views"]} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} name="Views" barSize={18}>
                        {data.topPages.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Hourly Traffic — Heatmap-style bars */}
            <div className="rounded-xl bg-card border border-border/40 p-5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Hourly Traffic Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => `${v}h`}
                      axisLine={false} tickLine={false} interval={2}
                    />
                    <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={25} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => `${v}:00 — ${(v as number) + 1}:00`} />
                    <Bar dataKey="count" name="Views" radius={[4, 4, 0, 0]} barSize={14}>
                      {data.hourlyData.map((entry, i) => {
                        const intensity = entry.count / hourlyMax;
                        const lightness = 47 - intensity * 15;
                        return <Cell key={i} fill={`hsl(174, 62%, ${lightness}%)`} opacity={0.3 + intensity * 0.7} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 4: Devices + Traffic Sources + Cookie Consent — Donut Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Device Breakdown Donut */}
            <div className="rounded-xl bg-card border border-border/40 p-5">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" /> Device Breakdown
              </h3>
              {deviceTotal === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No data</p>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceDonut} cx="50%" cy="50%"
                          innerRadius={45} outerRadius={70}
                          paddingAngle={3} dataKey="value"
                          stroke="none"
                        >
                          {deviceDonut.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val: number, name: string) => [`${val} (${Math.round((val / deviceTotal) * 100)}%)`, name]} />
                        {/* Center total */}
                        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: 20, fontWeight: 800 }}>
                          {deviceTotal}
                        </text>
                        <text x="50%" y="58%" textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>
                          views
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
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
            </div>

            {/* Traffic Sources Donut */}
            <div className="rounded-xl bg-card border border-border/40 p-5">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Traffic Sources
              </h3>
              {referrerDonut.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No referrer data</p>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={referrerDonut} cx="50%" cy="50%"
                          innerRadius={45} outerRadius={70}
                          paddingAngle={2} dataKey="value"
                          stroke="none"
                        >
                          {referrerDonut.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val: number, name: string, props: any) => [`${val} visits`, props.payload.fullName || name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
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
            </div>

            {/* Cookie Consent Donut */}
            <div className="rounded-xl bg-card border border-border/40 p-5">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Cookie className="w-4 h-4 text-primary" /> Cookie Consent
              </h3>
              {consentTotal === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No data</p>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={consentDonut} cx="50%" cy="50%"
                          innerRadius={45} outerRadius={70}
                          paddingAngle={3} dataKey="value"
                          stroke="none"
                        >
                          {consentDonut.map((d, i) => (
                            <Cell key={i} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(val: number, name: string) => [`${val} (${Math.round((val / consentTotal) * 100)}%)`, name]} />
                        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" className="fill-foreground" style={{ fontSize: 20, fontWeight: 800 }}>
                          {consentTotal}
                        </text>
                        <text x="50%" y="58%" textAnchor="middle" dominantBaseline="central" className="fill-muted-foreground" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1 }}>
                          users
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {consentDonut.map(c => (
                      <div key={c.name} className="flex items-center gap-1.5 text-[10px]">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                        <span className="text-muted-foreground">{c.name}</span>
                        <span className="font-semibold">{c.value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Stacked bar */}
                  <div className="w-full flex h-2 rounded-full overflow-hidden mt-3 bg-muted/20">
                    {consentDonut.map(c => (
                      <div key={c.name} style={{ width: `${(c.value / consentTotal) * 100}%`, background: c.color }} className="h-full transition-all duration-500" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info footer */}
          <div className="text-[10px] text-muted-foreground/50 text-center py-2">
            ℹ️ Admin browsing activity is excluded • Data refreshes in realtime • Showing up to 5,000 events
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
