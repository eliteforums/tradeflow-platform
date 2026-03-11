import { useIsMobile } from "@/hooks/use-mobile";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TherapistDashboardContent from "@/components/therapist/TherapistDashboardContent";

const TherapistDashboard = () => {
  return (
    <DashboardLayout>
      <TherapistDashboardContent />
    </DashboardLayout>
  );
};

export default TherapistDashboard;
