import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, startOfDay, format } from "date-fns";

export function useAnalyticsData() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const { data: pageViews = [], isLoading: isLoadingViews } = useQuery({
    queryKey: ["analytics-page-views"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", subDays(new Date(), 30).toISOString())
        .order("created_at", { ascending: false })
        .limit(1000) as any;
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
        .select("cookie_consent") as any;
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

  // Derived metrics
  const today = startOfDay(new Date()).toISOString();
  const week = subDays(new Date(), 7).toISOString();

  const viewsToday = pageViews.filter((e: any) => e.created_at >= today).length;
  const viewsWeek = pageViews.filter((e: any) => e.created_at >= week).length;
  const viewsMonth = pageViews.length;

  const uniqueVisitors = new Set(pageViews.map((e: any) => e.session_hash)).size;

  // Top pages
  const pageCounts: Record<string, number> = {};
  pageViews.forEach((e: any) => {
    pageCounts[e.page_path] = (pageCounts[e.page_path] || 0) + 1;
  });
  const topPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  // Hourly distribution
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
  pageViews.forEach((e: any) => {
    const hour = new Date(e.created_at).getHours();
    hourlyData[hour].count++;
  });

  // Device breakdown from screen_size
  const deviceCounts = { mobile: 0, tablet: 0, desktop: 0 };
  pageViews.forEach((e: any) => {
    if (!e.screen_size) return;
    const width = parseInt(e.screen_size.split("x")[0]);
    if (width < 768) deviceCounts.mobile++;
    else if (width < 1024) deviceCounts.tablet++;
    else deviceCounts.desktop++;
  });

  return {
    viewsToday,
    viewsWeek,
    viewsMonth,
    uniqueVisitors,
    topPages,
    hourlyData,
    deviceCounts,
    consentStats: consentStats || { accepted: 0, rejected: 0, pending: 0 },
    isLoading: isLoadingViews || isLoadingConsent,
  };
}
