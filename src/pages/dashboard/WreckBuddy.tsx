import DashboardLayout from "@/components/layout/DashboardLayout";
import WreckBuddy3D from "@/components/selfhelp/WreckBuddy3D";

const WreckBuddy = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 pb-24">
        <div>
          <h1 className="text-2xl font-bold font-display">Wreck the Buddy</h1>
          <p className="text-sm text-muted-foreground">Release stress through ragdoll bashing 🥊</p>
        </div>
        <WreckBuddy3D />
      </div>
    </DashboardLayout>
  );
};

export default WreckBuddy;
