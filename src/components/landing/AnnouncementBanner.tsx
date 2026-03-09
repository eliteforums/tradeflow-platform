import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const AnnouncementBanner = () => (
  <motion.div
    initial={{ y: -40, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="relative z-50 w-full py-2.5 px-4 text-center overflow-hidden"
    style={{
      background: "linear-gradient(90deg, hsl(270 60% 65%), hsl(270 80% 60%), hsl(174 62% 47%))",
    }}
  >
    <Link
      to="/institution-code"
      className="inline-flex items-center gap-2 text-sm font-medium text-white hover:underline"
    >
      <span>🎓 Eternia is now available for institutions — Get your campus code today</span>
      <ArrowRight className="w-4 h-4" />
    </Link>
  </motion.div>
);

export default AnnouncementBanner;
