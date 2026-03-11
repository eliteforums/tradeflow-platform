import { useState } from "react";
import { Coins, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, Gift, Award, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCredits } from "@/hooks/useCredits";
import { usePurchaseCredits } from "@/hooks/usePurchaseCredits";
import { format } from "date-fns";

const MobileCredits = () => {
  const [filter, setFilter] = useState("all");
  const { balance, transactions, isLoadingTransactions } = useCredits();
  const { purchaseCredits, isPurchasing, purchasingCredits, PACKAGES } = usePurchaseCredits();
  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthly = transactions.filter((t) => new Date(t.created_at) >= startOfMonth);
  const earned = monthly.filter((t) => t.delta > 0).reduce((s, t) => s + t.delta, 0);
  const spent = monthly.filter((t) => t.delta < 0).reduce((s, t) => s + Math.abs(t.delta), 0);

  const getIcon = (type: string) => {
    switch (type) { case "earn": return Award; case "spend": return Calendar; case "grant": return Gift; case "purchase": return CreditCard; default: return Coins; }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        <div>
          <h1 className="text-xl font-bold font-display">Wallet</h1>
          <p className="text-sm text-muted-foreground">Manage your ECC wallet</p>
        </div>

        {balance < 5 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-eternia-warning/10 border border-eternia-warning/20">
            <AlertCircle className="w-5 h-5 text-eternia-warning shrink-0" />
            <p className="text-sm text-eternia-warning font-medium">Your care energy is low. Refill gently.</p>
          </div>
        )}

        {/* Balance Card */}
        <div className="p-5 rounded-2xl bg-gradient-eternia text-background">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-background/70 text-xs mb-1">Available Balance</p>
              <h2 className="text-3xl font-bold font-display flex items-center gap-2"><Coins className="w-7 h-7" />{balance} <span className="text-base">ECC</span></h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-background/20">
            <div><p className="text-background/70 text-xs">Earned</p><p className="font-semibold text-sm flex items-center gap-1"><TrendingUp className="w-3 h-3" />+{earned}</p></div>
            <div><p className="text-background/70 text-xs">Spent</p><p className="font-semibold text-sm">-{spent}</p></div>
            <div><p className="text-background/70 text-xs">Cap</p><p className="font-semibold text-sm">5/day</p></div>
          </div>
        </div>

        {/* Top-up */}
        <div>
          <h3 className="font-semibold text-sm mb-2">Top-up</h3>
          <div className="grid grid-cols-2 gap-2">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.credits}
                onClick={() => purchaseCredits(pkg.credits)}
                disabled={isPurchasing}
                className={`p-4 rounded-2xl text-left border active:scale-[0.97] disabled:opacity-50 ${pkg.popular ? "bg-primary/10 border-primary" : "bg-card border-border"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm">{pkg.credits} ECC</span>
                    {pkg.popular && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px]">Popular</span>}
                    <p className="text-xs text-muted-foreground mt-0.5">{pkg.price}</p>
                  </div>
                  {isPurchasing && purchasingCredits === pkg.credits ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <Coins className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">History</h3>
            <div className="flex gap-1">
              {["all", "earn", "spend", "grant"].map((f) => (
                <Button key={f} variant={filter === f ? "default" : "ghost"} size="sm" onClick={() => setFilter(f)} className={`text-xs h-8 px-2.5 ${filter === f ? "bg-primary text-primary-foreground" : ""}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          {isLoadingTransactions ? <div className="flex items-center justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            : filtered.length === 0 ? <div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-border"><Coins className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No transactions</p></div>
            : (
              <div className="space-y-2">
                {filtered.map((tx) => {
                  const Icon = getIcon(tx.type);
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.delta > 0 ? "bg-eternia-success/10 text-eternia-success" : "bg-destructive/10 text-destructive"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{tx.notes || tx.type}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(tx.created_at), "MMM d, h:mm a")}</p>
                        </div>
                      </div>
                      <span className={`font-semibold text-sm shrink-0 flex items-center gap-1 ${tx.delta > 0 ? "text-eternia-success" : "text-destructive"}`}>
                        {tx.delta > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}{tx.delta > 0 ? "+" : ""}{tx.delta}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* Info */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border">
          <h4 className="font-medium text-sm mb-1">Credit Costs</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Expert: 50 ECC • Peer: 20 ECC • Sounds/Self-Help: Free</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MobileCredits;
