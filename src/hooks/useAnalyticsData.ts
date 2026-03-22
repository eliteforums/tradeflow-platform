import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, startOfDay } from "date-fns";

export function useAnalyticsData() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const { data: pageViews = [], isLoading: isLoadingViews } = useQuery({
    queryKey: ["analytics-page-views"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("analytics_events" as any) as any)
        .select("id, user_id, session_hash, page_path, screen_size, created_at")
        .gte("created_at", subDays(new Date(), 30).toISOString())
        .order("created_at", { ascending: false })
        .limit(1000);
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

  const today = startOfDay(new Date()).toISOString();
  const week = subDays(new Date(), 7).toISOString();

  const viewsToday = pageViews.filter((e: any) => e.created_at >= today).length;
  const viewsWeek = pageViews.filter((e: any) => e.created_at >= week).length;
  const viewsMonth = pageViews.length;

  // Accurate unique visitor counting: deduplicate by user_id for authenticated, session_hash for anonymous
  const authenticatedUserIds = new Set(
    pageViews.filter((e: any) => e.user_id).map((e: any) => e.user_id)
  );
  const anonymousSessions = new Set(
    pageViews.filter((e: any) => !e.user_id).map((e: any) => e.session_hash)
  );
  const uniqueUsers = authenticatedUserIds.size;
  const uniqueAnonymous = anonymousSessions.size;
  const uniqueVisitors = uniqueUsers + uniqueAnonymous;

  const pageCounts: Record<string, number> = {};
  pageViews.forEach((e: any) => {
    pageCounts[e.page_path] = (pageCounts[e.page_path] || 0) + 1;
  });
  const topPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
  pageViews.forEach((e: any) => {
    const hour = new Date(e.created_at).getHours();
    hourlyData[hour].count++;
  });

  const deviceCounts = { mobile: 0, tablet: 0, desktop: 0 };
  pageViews.forEach((e: any) => {
    if (!e.screen_size) return;
    const width = parseInt(e.screen_size.split("x")[0]);
    if (width < 768) deviceCounts.mobile++;
    else if (width < 1024) deviceCounts.tablet++;
    else deviceCounts.desktop++;
  });

  return {
    viewsToday, viewsWeek, viewsMonth,
    uniqueVisitors, uniqueUsers, uniqueAnonymous,
    topPages, hourlyData, deviceCounts,
    consentStats: consentStats || { accepted: 0, rejected: 0, pending: 0 },
    isLoading: isLoadingViews || isLoadingConsent,
  };
}
