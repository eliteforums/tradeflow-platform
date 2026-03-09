import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Eagerly load landing + auth (first paint)
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";

// Lazy load everything else
const InstitutionCode = lazy(() => import("./pages/auth/InstitutionCode"));
const QRScan = lazy(() => import("./pages/auth/QRScan"));
const Register = lazy(() => import("./pages/auth/Register"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Appointments = lazy(() => import("./pages/dashboard/Appointments"));
const PeerConnect = lazy(() => import("./pages/dashboard/PeerConnect"));
const BlackBox = lazy(() => import("./pages/dashboard/BlackBox"));
const SoundTherapy = lazy(() => import("./pages/dashboard/SoundTherapy"));
const SelfHelp = lazy(() => import("./pages/dashboard/SelfHelp"));
const Credits = lazy(() => import("./pages/dashboard/Credits"));
const Profile = lazy(() => import("./pages/dashboard/Profile"));
const RecoverySetup = lazy(() => import("./pages/dashboard/RecoverySetup"));
const ExpertDashboard = lazy(() => import("./pages/dashboard/ExpertDashboard"));
const InternDashboard = lazy(() => import("./pages/dashboard/InternDashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min stale time — reduces refetching at scale
      gcTime: 1000 * 60 * 10, // 10 min garbage collection
      retry: 2,
      refetchOnWindowFocus: false, // Prevent thundering herd on tab focus
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
