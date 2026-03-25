import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, startOfDay, format, differenceInMinutes } from "date-fns";
import { useEffect, useState, useMemo, useCallback } from "react";

export type DateRange = "today" | "7d" | "30d" | "90d";

function getRangeDate(range: DateRange): Date {
  switch (range) {
    case "today": return startOfDay(new Date());
    case "7d": return subDays(new Date(), 7);
    case "30d": return subDays(new Date(), 30);
    case "90d": return subDays(new Date(), 90);
  }
}

function extractDomain(referrer: string | null): string {
  if (!referrer || referrer === "" || referrer === "null") return "(direct)";
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

export function useAnalyticsData(dateRange: DateRange = "30d") {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const queryClient = useQueryClient();
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState<number>(Date.now());

  const rangeDate = getRangeDate(dateRange);

  const { data: pageViews = [], isLoading: isLoadingViews } = useQuery({
    queryKey: ["analytics-page-views", dateRange],
    queryFn: async () => {
      const { data, error } = await (supabase.from("analytics_events" as any) as any)
        .select("id, user_id, session_hash, page_path, screen_size, created_at, referrer, user_agent")
        .gte("created_at", rangeDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const { data: consentStats, isLoading: isLoadingConsent } = useQuery({
    queryKey: ["analytics-consent-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("cookie_consent" as any);
      if (error) throw error;
      const stats = { accepted: 0, rejected: 0, pending: 0 };
      (data || []).forEach((p: any) => {
        const status = p.cookie_consent || "pending";
        if (status in stats) stats[status as keyof typeof stats]++;
      });
      return stats;
    },
    enabled: isAdmin,
  });

  // Realtime subscription
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("analytics-realtime")
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "analytics_events" },
        () => {
          setLastRealtimeEvent(Date.now());
          queryClient.invalidateQueries({ queryKey: ["analytics-page-views"] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, queryClient]);

  return useMemo(() => {
    const now = new Date();
    const today = startOfDay(now).toISOString();
    const week = subDays(now, 7).toISOString();

    const viewsToday = pageViews.filter((e: any) => e.created_at >= today).length;
    const viewsWeek = pageViews.filter((e: any) => e.created_at >= week).length;
    const viewsTotal = pageViews.length;

    // Unique visitors
    const authenticatedUserIds = new Set(
      pageViews.filter((e: any) => e.user_id).map((e: any) => e.user_id)
    );
    const anonymousSessions = new Set(
      pageViews.filter((e: any) => !e.user_id).map((e: any) => e.session_hash)
    );
    const uniqueUsers = authenticatedUserIds.size;
    const uniqueAnonymous = anonymousSessions.size;
    const uniqueVisitors = uniqueUsers + uniqueAnonymous;

    // Session-based metrics
    const sessionPages: Record<string, any[]> = {};
    pageViews.forEach((e: any) => {
      if (!sessionPages[e.session_hash]) sessionPages[e.session_hash] = [];
      sessionPages[e.session_hash].push(e);
    });
    const totalSessions = Object.keys(sessionPages).length;
    const bounceSessions = Object.values(sessionPages).filter(pages => pages.length === 1).length;
    const bounceRate = totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 100) : 0;

    // Avg session duration (approx from timestamps)
    let totalDuration = 0;
    let durationCount = 0;
    Object.values(sessionPages).forEach(pages => {
      if (pages.length < 2) return;
      const sorted = pages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const mins = differenceInMinutes(new Date(sorted[sorted.length - 1].created_at), new Date(sorted[0].created_at));
      if (mins > 0 && mins < 120) { totalDuration += mins; durationCount++; }
    });
    const avgSessionDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

    // Live now (sessions in last 5 min)
    const fiveMinAgo = subDays(now, 0);
    fiveMinAgo.setMinutes(fiveMinAgo.getMinutes() - 5);
    const liveNow = new Set(
      pageViews.filter((e: any) => new Date(e.created_at) >= fiveMinAgo).map((e: any) => e.session_hash)
    ).size;

    // Top pages with per-page stats
    const pageStats: Record<string, { views: number; sessions: Set<string> }> = {};
    pageViews.forEach((e: any) => {
      if (!pageStats[e.page_path]) pageStats[e.page_path] = { views: 0, sessions: new Set() };
      pageStats[e.page_path].views++;
      pageStats[e.page_path].sessions.add(e.session_hash);
    });
    const topPages = Object.entries(pageStats)
      .sort(([, a], [, b]) => b.views - a.views)
      .slice(0, 10)
      .map(([path, s]) => ({ path, count: s.views, uniqueSessions: s.sessions.size }));

    // Hourly data
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    pageViews.forEach((e: any) => {
      const hour = new Date(e.created_at).getHours();
      hourlyData[hour].count++;
    });

    // Daily trend with auth/anon split
    const dailySplit: Record<string, { total: number; auth: number; anon: number }> = {};
    pageViews.forEach((e: any) => {
      const day = format(new Date(e.created_at), "yyyy-MM-dd");
      if (!dailySplit[day]) dailySplit[day] = { total: 0, auth: 0, anon: 0 };
      dailySplit[day].total++;
      if (e.user_id) dailySplit[day].auth++;
      else dailySplit[day].anon++;
    });
    const dailyTrend = Object.entries(dailySplit)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({ date, count: d.total, authenticated: d.auth, anonymous: d.anon }));

    // Device breakdown
    const deviceCounts = { mobile: 0, tablet: 0, desktop: 0 };
    pageViews.forEach((e: any) => {
      if (!e.screen_size) return;
      const width = parseInt(e.screen_size.split("x")[0]);
      if (width < 768) deviceCounts.mobile++;
      else if (width < 1024) deviceCounts.tablet++;
      else deviceCounts.desktop++;
    });

    // Referrer breakdown
    const referrerCounts: Record<string, number> = {};
    pageViews.forEach((e: any) => {
      const domain = extractDomain(e.referrer);
      referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
    });
    const topReferrers = Object.entries(referrerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([source, count]) => ({ source, count }));

    // Unique page paths for filter
    const allPagePaths = [...new Set(pageViews.map((e: any) => e.page_path as string))].sort();

    return {
      viewsToday, viewsWeek, viewsTotal,
      uniqueVisitors, uniqueUsers, uniqueAnonymous,
      bounceRate, avgSessionDuration, liveNow, totalSessions,
      topPages, hourlyData, dailyTrend, deviceCounts,
      topReferrers, allPagePaths,
      consentStats: consentStats || { accepted: 0, rejected: 0, pending: 0 },
      isLoading: isLoadingViews || isLoadingConsent,
      lastRealtimeEvent,
    };
  }, [pageViews, consentStats, isLoadingViews, isLoadingConsent, lastRealtimeEvent]);
}
