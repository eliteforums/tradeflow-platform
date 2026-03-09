import { useState } from "react";
import { Coins, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, Gift, Award, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCredits } from "@/hooks/useCredits";
import { format } from "date-fns";

const MobileCredits = () => {
  const [filter, setFilter] = useState("all");
  const { balance, transactions, isLoadingTransactions } = useCredits();
  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthly = transactions.filter((t) => new Date(t.created_at) >= startOfMonth);
  const earned = monthly.filter((t) => t.delta > 0).reduce((s, t) => s + t.delta, 0);
  const spent = monthly.filter((t) => t.delta < 0).reduce((s, t) => s + Math.abs(t.delta), 0);

  const getIcon = (type: string) => {
    switch (type) { case "earn": return Award; case "spend": return Calendar; case "grant": return Gift; case "purchase": return CreditCard; default: return Coins; }
  };

  const packages = [
    { credits: 50, price: "₹99", popular: false },
    { credits: 100, price: "₹179", popular: true },
    { credits: 250, price: "₹399", popular: false },
    { credits: 500, price: "₹699", popular: false },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-3 pb-24">
        <div>
          <h1 className="text-lg font-bold font-display">Care Credits</h1>
          <p className="text-[11px] text-muted-foreground">Manage your ECC</p>
        </div>

        {balance < 5 && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-eternia-warning/10 border border-eternia-warning/20">
            <AlertCircle className="w-4 h-4 text-eternia-warning shrink-0" />
            <p className="text-[10px] text-eternia-warning font-medium">Low balance — earn credits via self-help</p>
          </div>
        )}

        {/* Balance Card */}
        <div className="p-3 rounded-xl bg-gradient-eternia text-background">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-background/70 text-[10px] mb-0.5">Available Balance</p>
              <h2 className="text-2xl font-bold font-display flex items-center gap-1.5"><Coins className="w-6 h-6" />{balance} <span className="text-sm">ECC</span></h2>
            </div>
            <Button className="bg-background/20 hover:bg-background/30 text-background border-0 text-[10px] h-7 px-2"><CreditCard className="w-3 h-3 mr-1" />Add</Button>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-background/20">
            <div><p className="text-background/70 text-[9px]">Earned</p><p className="font-semibold text-xs flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />+{earned}</p></div>
            <div><p className="text-background/70 text-[9px]">Spent</p><p className="font-semibold text-xs">-{spent}</p></div>
            <div><p className="text-background/70 text-[9px]">Cap</p><p className="font-semibold text-xs">5/day</p></div>
          </div>
        </div>

        {/* Top-up */}
        <div>
          <h3 className="font-semibold text-xs mb-1.5">Top-up</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {packages.map((pkg) => (
              <button key={pkg.credits} className={`p-2.5 rounded-xl text-left border active:scale-[0.97] ${pkg.popular ? "bg-primary/10 border-primary" : "bg-card border-border"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs">{pkg.credits} ECC</span>
                    {pkg.popular && <span className="ml-1 px-1 py-0.5 rounded-full bg-primary text-primary-foreground text-[8px]">Popular</span>}
                    <p className="text-[10px] text-muted-foreground">{pkg.price}</p>
                  </div>
                  <Coins className="w-4 h-4 text-primary" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="font-semibold text-xs">History</h3>
            <div className="flex gap-0.5">
              {["all", "earn", "spend", "grant"].map((f) => (
                <Button key={f} variant={filter === f ? "default" : "ghost"} size="sm" onClick={() => setFilter(f)} className={`text-[9px] h-6 px-1.5 ${filter === f ? "bg-primary text-primary-foreground" : ""}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          {isLoadingTransactions ? <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            : filtered.length === 0 ? <div className="text-center py-8 text-muted-foreground bg-card rounded-xl border border-border"><Coins className="w-6 h-6 mx-auto mb-1 opacity-50" /><p className="text-[10px]">No transactions</p></div>
            : (
              <div className="space-y-1.5">
                {filtered.map((tx) => {
                  const Icon = getIcon(tx.type);
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.delta > 0 ? "bg-eternia-success/10 text-eternia-success" : "bg-destructive/10 text-destructive"}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs truncate">{tx.notes || tx.type}</p>
                          <p className="text-[9px] text-muted-foreground">{format(new Date(tx.created_at), "MMM d, h:mm a")}</p>
                        </div>
                      </div>
                      <span className={`font-semibold text-xs shrink-0 flex items-center gap-0.5 ${tx.delta > 0 ? "text-eternia-success" : "text-destructive"}`}>
                        {tx.delta > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{tx.delta > 0 ? "+" : ""}{tx.delta}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* Info */}
        <div className="p-2.5 rounded-xl bg-muted/30 border border-border">
          <h4 className="font-medium text-[10px] mb-1">Credit Costs</h4>
          <ul className="space-y-0.5 text-[9px] text-muted-foreground">
            <li>• Expert: 50 ECC • Peer: 20 ECC • Sounds/Self-Help: Free</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MobileCredits;
