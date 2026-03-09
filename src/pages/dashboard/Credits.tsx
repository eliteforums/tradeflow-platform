import { useState } from "react";
import {
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  Gift,
  Award,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCredits } from "@/hooks/useCredits";
import { format } from "date-fns";

const Credits = () => {
  const [filter, setFilter] = useState("all");
  const { balance, transactions, isLoadingTransactions } = useCredits();

  const filteredTransactions =
    filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
      case "earn":
        return Award;
      case "spend":
        return Calendar;
      case "grant":
        return Gift;
      case "purchase":
        return CreditCard;
      default:
        return Coins;
    }
  };

  const creditPackages = [
    { credits: 50, price: "₹99", popular: false },
    { credits: 100, price: "₹179", popular: true },
    { credits: 250, price: "₹399", popular: false },
    { credits: 500, price: "₹699", popular: false },
  ];

  // Calculate monthly stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyTransactions = transactions.filter(
    (t) => new Date(t.created_at) >= startOfMonth
  );
  const earnedThisMonth = monthlyTransactions
    .filter((t) => t.delta > 0)
    .reduce((sum, t) => sum + t.delta, 0);
  const spentThisMonth = monthlyTransactions
    .filter((t) => t.delta < 0)
    .reduce((sum, t) => sum + Math.abs(t.delta), 0);

  const isLowBalance = balance < 5;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Care Credits</h1>
          <p className="text-muted-foreground">
            Manage your Eternia Care Credits (ECC) for platform services
          </p>
        </div>

        {/* Low Balance Warning */}
        {isLowBalance && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-eternia-warning/10 border border-eternia-warning/20">
            <AlertCircle className="w-5 h-5 text-eternia-warning shrink-0" />
            <div>
              <p className="font-medium text-eternia-warning">Your care energy is low</p>
              <p className="text-sm text-muted-foreground">
                Refill gently to continue accessing support services
              </p>
            </div>
          </div>
        )}

        {/* Balance Card */}
        <div className="p-6 rounded-2xl bg-gradient-eternia text-background">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-background/70 mb-1">Available Balance</p>
              <h2 className="text-4xl font-bold font-display flex items-center gap-2">
                <Coins className="w-10 h-10" />
                {balance} ECC
              </h2>
            </div>
            <Button className="bg-background/20 hover:bg-background/30 text-background border-0">
              <CreditCard className="w-5 h-5 mr-2" />
              Add Credits
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-background/20">
            <div>
              <p className="text-background/70 text-sm">Earned This Month</p>
              <p className="font-semibold text-lg flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />+{earnedThisMonth} ECC
              </p>
            </div>
            <div>
              <p className="text-background/70 text-sm">Spent This Month</p>
              <p className="font-semibold text-lg">-{spentThisMonth} ECC</p>
            </div>
            <div>
              <p className="text-background/70 text-sm">Daily Earn Cap</p>
              <p className="font-semibold text-lg">5 ECC/day</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold font-display">Transaction History</h3>
              <div className="flex gap-2">
                {["all", "earn", "spend", "grant"].map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className={filter === f ? "bg-primary text-primary-foreground" : ""}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {isLoadingTransactions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                <Coins className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((tx) => {
                  const Icon = getIcon(tx.type);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            tx.delta > 0
                              ? "bg-eternia-success/10 text-eternia-success"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{tx.notes || tx.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(tx.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-semibold flex items-center gap-1 ${
                          tx.delta > 0 ? "text-eternia-success" : "text-destructive"
                        }`}
                      >
                        {tx.delta > 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {tx.delta > 0 ? "+" : ""}
                        {tx.delta} ECC
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Buy Credits */}
          <div className="space-y-4">
            <h3 className="font-semibold font-display">Top-up Credits</h3>
            <div className="space-y-3">
              {creditPackages.map((pkg) => (
                <button
                  key={pkg.credits}
                  className={`w-full p-4 rounded-xl text-left transition-all border ${
                    pkg.popular
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{pkg.credits} ECC</span>
                        {pkg.popular && (
                          <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{pkg.price}</p>
                    </div>
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <h4 className="font-medium mb-2 text-sm">How to Earn Credits</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Complete Quest Cards (max 5/day)
                </li>
                <li className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" />
                  Maintain daily streaks
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Institution grants
                </li>
              </ul>
            </div>

            {/* ECC Info */}
            <div className="p-4 rounded-xl bg-gradient-eternia-subtle border border-border">
              <h4 className="font-medium mb-2 text-sm">Credit Costs</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Expert Appointment: 50 ECC</li>
                <li>• Peer Connect Session: 20 ECC</li>
                <li>• Sound Therapy: Free</li>
                <li>• Self-Help Tools: Free</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Credits;
