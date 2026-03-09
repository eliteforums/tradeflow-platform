import { useState } from "react";
import {
  Coins, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, Gift, Award, TrendingUp, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCredits } from "@/hooks/useCredits";
import { format } from "date-fns";

const Credits = () => {
  const [filter, setFilter] = useState("all");
  const { balance, transactions, isLoadingTransactions } = useCredits();

  const filteredTransactions = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case "earn": return Award;
      case "spend": return Calendar;
      case "grant": return Gift;
      case "purchase": return CreditCard;
      default: return Coins;
    }
  };

  const creditPackages = [
    { credits: 50, price: "₹99", popular: false },
    { credits: 100, price: "₹179", popular: true },
    { credits: 250, price: "₹399", popular: false },
    { credits: 500, price: "₹699", popular: false },
  ];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyTransactions = transactions.filter((t) => new Date(t.created_at) >= startOfMonth);
  const earnedThisMonth = monthlyTransactions.filter((t) => t.delta > 0).reduce((sum, t) => sum + t.delta, 0);
  const spentThisMonth = monthlyTransactions.filter((t) => t.delta < 0).reduce((sum, t) => sum + Math.abs(t.delta), 0);
  const isLowBalance = balance < 5;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display mb-1">Care Credits</h1>
          <p className="text-sm text-muted-foreground">Manage your Eternia Care Credits (ECC)</p>
        </div>

        {isLowBalance && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-eternia-warning/10 border border-eternia-warning/20">
            <AlertCircle className="w-5 h-5 text-eternia-warning shrink-0" />
            <div>
              <p className="font-medium text-sm text-eternia-warning">Your care energy is low</p>
              <p className="text-xs text-muted-foreground">Earn credits through self-help activities</p>
            </div>
          </div>
        )}

        {/* Balance Card */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-eternia text-background">
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div>
              <p className="text-background/70 text-xs sm:text-sm mb-1">Available Balance</p>
              <h2 className="text-3xl sm:text-4xl font-bold font-display flex items-center gap-2">
                <Coins className="w-7 h-7 sm:w-10 sm:h-10" />
                {balance} <span className="text-lg sm:text-2xl">ECC</span>
              </h2>
            </div>
            <Button className="bg-background/20 hover:bg-background/30 text-background border-0 text-xs sm:text-sm h-8 sm:h-9 px-3">
              <CreditCard className="w-4 h-4 mr-1.5" />
              Add
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-background/20">
            <div>
              <p className="text-background/70 text-[10px] sm:text-sm">Earned</p>
              <p className="font-semibold text-sm sm:text-lg flex items-center gap-1">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />+{earnedThisMonth}
              </p>
            </div>
            <div>
              <p className="text-background/70 text-[10px] sm:text-sm">Spent</p>
              <p className="font-semibold text-sm sm:text-lg">-{spentThisMonth}</p>
            </div>
            <div>
              <p className="text-background/70 text-[10px] sm:text-sm">Daily Cap</p>
              <p className="font-semibold text-sm sm:text-lg">5/day</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Transaction History */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold font-display text-sm sm:text-base">History</h3>
              <div className="flex gap-1 overflow-x-auto">
                {["all", "earn", "spend", "grant"].map((f) => (
                  <Button key={f} variant={filter === f ? "default" : "ghost"} size="sm" onClick={() => setFilter(f)}
                    className={`text-xs h-7 px-2 shrink-0 ${filter === f ? "bg-primary text-primary-foreground" : ""}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {isLoadingTransactions ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border">
                <Coins className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((tx) => {
                  const Icon = getIcon(tx.type);
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-card border border-border gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.delta > 0 ? "bg-eternia-success/10 text-eternia-success" : "bg-destructive/10 text-destructive"}`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{tx.notes || tx.type}</p>
                          <p className="text-[11px] sm:text-xs text-muted-foreground">{format(new Date(tx.created_at), "MMM d, h:mm a")}</p>
                        </div>
                      </div>
                      <div className={`font-semibold text-sm flex items-center gap-0.5 shrink-0 ${tx.delta > 0 ? "text-eternia-success" : "text-destructive"}`}>
                        {tx.delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {tx.delta > 0 ? "+" : ""}{tx.delta}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Buy Credits */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold font-display text-sm sm:text-base">Top-up Credits</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
              {creditPackages.map((pkg) => (
                <button key={pkg.credits} className={`p-3 sm:p-4 rounded-xl text-left transition-all border ${pkg.popular ? "bg-primary/10 border-primary" : "bg-card border-border hover:border-primary/50"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm sm:text-lg">{pkg.credits} ECC</span>
                        {pkg.popular && <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px]">Popular</span>}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{pkg.price}</p>
                    </div>
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border">
              <h4 className="font-medium text-xs sm:text-sm mb-2">How to Earn</h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-primary shrink-0" />Complete Quest Cards</li>
                <li className="flex items-center gap-2"><Gift className="w-3.5 h-3.5 text-primary shrink-0" />Maintain streaks</li>
                <li className="flex items-center gap-2"><CreditCard className="w-3.5 h-3.5 text-primary shrink-0" />Institution grants</li>
              </ul>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-gradient-eternia-subtle border border-border">
              <h4 className="font-medium text-xs sm:text-sm mb-1.5">Credit Costs</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Expert Appointment: 50 ECC</li>
                <li>• Peer Connect: 20 ECC</li>
                <li>• Sound Therapy: Free</li>
                <li>• Self-Help: Free</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Credits;
