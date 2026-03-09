import { useState } from "react";
import {
  Coins,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  CreditCard,
  Gift,
  Award,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Credits = () => {
  const [filter, setFilter] = useState("all");

  const transactions = [
    {
      id: 1,
      type: "earn",
      description: "Quest Card Completed",
      amount: 10,
      date: "Today, 2:30 PM",
      icon: Award,
    },
    {
      id: 2,
      type: "spend",
      description: "Expert Session - Dr. Sharma",
      amount: -50,
      date: "Yesterday, 4:00 PM",
      icon: Calendar,
    },
    {
      id: 3,
      type: "earn",
      description: "7-Day Streak Bonus",
      amount: 25,
      date: "Mar 7, 12:00 AM",
      icon: Gift,
    },
    {
      id: 4,
      type: "purchase",
      description: "Credit Top-up",
      amount: 100,
      date: "Mar 5, 10:15 AM",
      icon: CreditCard,
    },
    {
      id: 5,
      type: "spend",
      description: "Peer Connect Session",
      amount: -20,
      date: "Mar 3, 3:45 PM",
      icon: Calendar,
    },
    {
      id: 6,
      type: "grant",
      description: "Institution Welcome Bonus",
      amount: 100,
      date: "Mar 1, 9:00 AM",
      icon: Gift,
    },
  ];

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const creditPackages = [
    { credits: 50, price: "₹99", popular: false },
    { credits: 100, price: "₹179", popular: true },
    { credits: 250, price: "₹399", popular: false },
    { credits: 500, price: "₹699", popular: false },
  ];

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

        {/* Balance Card */}
        <div className="p-6 rounded-2xl bg-gradient-eternia text-background">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-background/70 mb-1">Available Balance</p>
              <h2 className="text-4xl font-bold font-display flex items-center gap-2">
                <Coins className="w-10 h-10" />
                250 ECC
              </h2>
            </div>
            <Button className="bg-background/20 hover:bg-background/30 text-background border-0">
              <Plus className="w-5 h-5 mr-2" />
              Add Credits
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-background/20">
            <div>
              <p className="text-background/70 text-sm">Earned This Month</p>
              <p className="font-semibold text-lg flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +85 ECC
              </p>
            </div>
            <div>
              <p className="text-background/70 text-sm">Spent This Month</p>
              <p className="font-semibold text-lg">-70 ECC</p>
            </div>
            <div>
              <p className="text-background/70 text-sm">Expiring Soon</p>
              <p className="font-semibold text-lg">0 ECC</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction History */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold font-display">Transaction History</h3>
              <div className="flex gap-2">
                {["all", "earn", "spend", "purchase"].map((f) => (
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

            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.amount > 0
                          ? "bg-eternia-success/10 text-eternia-success"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      <tx.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                  <div
                    className={`font-semibold flex items-center gap-1 ${
                      tx.amount > 0 ? "text-eternia-success" : "text-destructive"
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount} ECC
                  </div>
                </div>
              ))}
            </div>
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
                  Complete Quest Cards
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Credits;
