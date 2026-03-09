import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Landing from "./pages/Landing";
import InstitutionCode from "./pages/auth/InstitutionCode";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/institution-code" element={<InstitutionCode />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/appointments" element={<Appointments />} />
          <Route path="/dashboard/peer-connect" element={<PeerConnect />} />
          <Route path="/dashboard/blackbox" element={<BlackBox />} />
          <Route path="/dashboard/sound-therapy" element={<SoundTherapy />} />
          <Route path="/dashboard/self-help" element={<SelfHelp />} />
          <Route path="/dashboard/credits" element={<Credits />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
