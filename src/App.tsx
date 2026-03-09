import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import InstitutionCode from "./pages/auth/InstitutionCode";
import QRScan from "./pages/auth/QRScan";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Appointments from "./pages/dashboard/Appointments";
import PeerConnect from "./pages/dashboard/PeerConnect";
import BlackBox from "./pages/dashboard/BlackBox";
import SoundTherapy from "./pages/dashboard/SoundTherapy";
import SelfHelp from "./pages/dashboard/SelfHelp";
import Credits from "./pages/dashboard/Credits";
import Profile from "./pages/dashboard/Profile";
import RecoverySetup from "./pages/dashboard/RecoverySetup";
import ExpertDashboard from "./pages/dashboard/ExpertDashboard";
import InternDashboard from "./pages/dashboard/InternDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/institution-code" element={<InstitutionCode />} />
            <Route path="/qr-scan" element={<QRScan />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/dashboard/peer-connect" element={<ProtectedRoute><PeerConnect /></ProtectedRoute>} />
            <Route path="/dashboard/blackbox" element={<ProtectedRoute><BlackBox /></ProtectedRoute>} />
            <Route path="/dashboard/sound-therapy" element={<ProtectedRoute><SoundTherapy /></ProtectedRoute>} />
            <Route path="/dashboard/self-help" element={<ProtectedRoute><SelfHelp /></ProtectedRoute>} />
            <Route path="/dashboard/credits" element={<ProtectedRoute><Credits /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard/recovery-setup" element={<ProtectedRoute><RecoverySetup /></ProtectedRoute>} />
            
            {/* Role-Based Dashboards */}
            <Route path="/dashboard/expert" element={<ProtectedRoute allowedRoles={["expert"]}><ExpertDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/intern" element={<ProtectedRoute allowedRoles={["intern"]}><InternDashboard /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["spoc", "admin"]}><AdminDashboard /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
