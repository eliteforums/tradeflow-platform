import { motion, AnimatePresence } from "framer-motion";
import { Award, CheckCircle, Sparkles } from "lucide-react";

interface QuestCard3DProps {
  quests: Array<{ id: string; title: string; xp_reward: number }>;
  completedIds: string[];
  onComplete: (id: string) => void;
}

export default function QuestCard3D({ quests, completedIds, onComplete }: QuestCard3DProps) {
  const visibleQuests = quests.slice(0, 3);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {visibleQuests.map((quest, i) => {
        const isCompleted = completedIds.includes(quest.id);
        return (
          <motion.button
            key={quest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: isCompleted ? 1 : 1.03 }}
            whileTap={{ scale: isCompleted ? 1 : 0.97 }}
            onClick={() => !isCompleted && onComplete(quest.id)}
            disabled={isCompleted}
            className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-left border transition-all min-h-[140px] flex flex-col justify-between ${
              isCompleted
                ? "bg-eternia-success/10 border-eternia-success/30"
                : "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-400/40 cursor-pointer"
            }`}
          >
            {/* Decorative corner */}
            {!isCompleted && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/15 to-transparent rounded-bl-3xl" />
            )}

            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? "bg-eternia-success/20"
                    : "bg-gradient-to-br from-amber-500 to-orange-500"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-eternia-success" />
                ) : (
                  <Award className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold line-clamp-2 leading-snug">
                  {quest.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isCompleted
                  ? "bg-eternia-success/15 text-eternia-success"
                  : "bg-amber-500/15 text-amber-500"
              }`}>
                +{quest.xp_reward} XP
              </span>
              {isCompleted && (
                <AnimatePresence>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-xs text-eternia-success font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    Done!
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
