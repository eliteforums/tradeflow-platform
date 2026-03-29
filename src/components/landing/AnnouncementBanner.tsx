import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const AnnouncementBanner = () => (
  <motion.div
    initial={{ y: -30, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.4 }}
    className="relative z-50 w-full py-2 px-4 text-center"
    style={{
      background: "linear-gradient(90deg, hsl(262 52% 60%), hsl(275 70% 58%), hsl(166 72% 46%))",
    }}
  >
    <Link
      to="/contact-institution"
      className="inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-white hover:underline"
    >
      <span>🎓 Bring Eternia to your campus — Apply now</span>
      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
    </Link>
  </motion.div>
);

export default AnnouncementBanner;
