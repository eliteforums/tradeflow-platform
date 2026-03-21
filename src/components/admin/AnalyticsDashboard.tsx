import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { Eye, Users, Monitor, Smartphone, Tablet, Cookie, TrendingUp, BarChart3, Loader2 } from "lucide-react";

const AnalyticsDashboard = () => {
  const {
    viewsToday, viewsWeek, viewsMonth, uniqueVisitors,
    topPages, hourlyData, deviceCounts, consentStats, isLoading,
  } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const maxHourly = Math.max(...hourlyData.map(h => h.count), 1);

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Views Today", value: viewsToday, icon: Eye, iconBg: "bg-primary/10", iconColor: "text-primary" },
          { label: "Views (7d)", value: viewsWeek, icon: TrendingUp, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
          { label: "Views (30d)", value: viewsMonth, icon: BarChart3, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
          { label: "Unique Visitors", value: uniqueVisitors, icon: Users, iconBg: "bg-accent/10", iconColor: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors">
            <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <p className="text-2xl font-bold leading-none">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Pages */}
        <div className="rounded-2xl bg-card border border-border/50 p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Top Pages
          </h3>
          {topPages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-2">
              {topPages.map((p, i) => (
                <div key={p.path} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{p.path}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{p.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{ width: `${(p.count / (topPages[0]?.count || 1)) * 100}%` }}
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
            <TrendingUp className="w-4 h-4 text-primary" /> Hourly Traffic (30d)
          </h3>
          <div className="grid grid-cols-12 gap-1 h-32">
            {hourlyData.map((h) => (
              <div key={h.hour} className="flex flex-col items-center justify-end gap-1">
                <div
                  className="w-full rounded-t bg-primary/40 hover:bg-primary/60 transition-colors min-h-[2px]"
                  style={{ height: `${(h.count / maxHourly) * 100}%` }}
                  title={`${h.hour}:00 — ${h.count} views`}
                />
                {h.hour % 4 === 0 && (
                  <span className="text-[9px] text-muted-foreground">{h.hour}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Device Breakdown */}
        <div className="rounded-2xl bg-card border border-border/50 p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-primary" /> Devices
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Desktop", value: deviceCounts.desktop, icon: Monitor },
              { label: "Tablet", value: deviceCounts.tablet, icon: Tablet },
              { label: "Mobile", value: deviceCounts.mobile, icon: Smartphone },
            ].map((d) => (
              <div key={d.label} className="p-3 rounded-xl bg-muted/20 border border-border/30 text-center">
                <d.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-lg font-bold">{d.value}</p>
                <p className="text-[10px] text-muted-foreground">{d.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cookie Consent Stats */}
        <div className="rounded-2xl bg-card border border-border/50 p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Cookie className="w-4 h-4 text-primary" /> Cookie Consent
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Accepted", value: consentStats.accepted, color: "bg-emerald-500" },
              { label: "Rejected", value: consentStats.rejected, color: "bg-destructive" },
              { label: "Pending", value: consentStats.pending, color: "bg-amber-500" },
            ].map((c) => (
              <div key={c.label} className="p-3 rounded-xl bg-muted/20 border border-border/30 text-center">
                <div className={`w-3 h-3 rounded-full ${c.color} mx-auto mb-2`} />
                <p className="text-lg font-bold">{c.value}</p>
                <p className="text-[10px] text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>
          {/* Bar */}
          {(() => {
            const total = consentStats.accepted + consentStats.rejected + consentStats.pending;
            if (total === 0) return null;
            return (
              <div className="flex h-2 rounded-full overflow-hidden mt-4 bg-muted">
                <div className="bg-emerald-500" style={{ width: `${(consentStats.accepted / total) * 100}%` }} />
                <div className="bg-destructive" style={{ width: `${(consentStats.rejected / total) * 100}%` }} />
                <div className="bg-amber-500" style={{ width: `${(consentStats.pending / total) * 100}%` }} />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
