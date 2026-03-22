import DashboardLayout from "@/components/layout/DashboardLayout";

const TibetanBowl = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 pb-24">
        <div>
          <h1 className="text-2xl font-bold font-display">Tibetan Singing Bowl</h1>
          <p className="text-sm text-muted-foreground">4-7-8 breathing with singing bowls 🔔</p>
        </div>
        <div className="w-full h-full min-h-[60vh] rounded-2xl overflow-hidden border border-border/50">
          <iframe
            src="/games/tibetan-bowl.html"
            title="Tibetan Singing Bowl – Sound Meditation"
            className="w-full h-full border-0"
            style={{ minHeight: "60vh" }}
            allow="autoplay"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TibetanBowl;
