// client/src/pages/SubscriptionsPage.tsx
import * as React from "react";
import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Toggle from "@radix-ui/react-toggle";
import {
  Check,
  X,
  Edit,
  Users,
  Calendar,
  CreditCard,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Bell,
  BellOff,
  Plus,
  Loader2,
} from "lucide-react";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

// Types
type PlanTier = "Basic" | "Premium" | "Fleet" | "Elite";
type SubscriptionStatus = "active" | "canceled" | "expired" | "pending";

interface Plan {
  id: string;
  tier: PlanTier;
  price: number;
  billingCycle: "monthly" | "yearly";
  benefits: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

interface Subscriber {
  id: string;
  customerName: string;
  planTier: PlanTier;
  nextBillingDate: string;
  status: SubscriptionStatus;
  benefitsUsed: number;
  benefitsTotal: number;
  whatsappReminder: boolean;
}

interface ChurnRetentionMetrics {
  activeCount: number;
  canceledThisMonth: number;
  projectedMRR: number;
}

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
}

interface SubscriptionsPageProps {
  onEditPlan?: (planId: string) => void;
}

const statusConfig: Record<
  SubscriptionStatus,
  { color: string; bg: string; label: string }
> = {
  active: { color: "text-green-400", bg: "bg-green-400/10", label: "Active" },
  canceled: { color: "text-red-400", bg: "bg-red-400/10", label: "Canceled" },
  expired: { color: "text-gray-400", bg: "bg-gray-400/10", label: "Expired" },
  pending: {
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    label: "Pending",
  },
};

const planTierConfig: Record<
  PlanTier,
  { label: string; color: string; bg: string; border: string }
> = {
  Basic: {
    label: "Basic",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  Premium: {
    label: "Premium",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  Fleet: {
    label: "Fleet",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  Elite: {
    label: "Elite",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
};

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({
  onEditPlan,
}) => {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [searchCustomerTerm, setSearchCustomerTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [subscriberSortColumn, setSubscriberSortColumn] =
    useState<keyof Subscriber>("customerName");
  const [subscriberSortDirection, setSubscriberSortDirection] = useState<
    "asc" | "desc"
  >("asc");

  const utils = trpc.useUtils();

  // Queries
  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = trpc.subscriptions.listPlans.useQuery();

  const {
    data: subscribersData,
    isLoading: subscribersLoading,
    error: subscribersError,
  } = trpc.subscriptions.listSubscribers.useQuery();

  const {
    data: customersData,
    isLoading: customersLoading,
  } = trpc.customers.list.useQuery(); // Assumes customers router exists

  // Mutations
  const subscribeMutation = trpc.subscriptions.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Subscription activated successfully");
      utils.subscriptions.listSubscribers.invalidate();
      setAssignModalOpen(false);
      setSelectedCustomer(null);
      setSelectedPlan(null);
      setSearchCustomerTerm("");
    },
    onError: (error) => {
      toast.error(`Failed to activate subscription: ${error.message}`);
    },
  });

  const cancelMutation = trpc.subscriptions.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Subscription canceled");
      utils.subscriptions.listSubscribers.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to cancel subscription: ${error.message}`);
    },
  });

  const toggleReminderMutation = trpc.subscriptions.toggleReminder.useMutation({
    onSuccess: () => {
      utils.subscriptions.listSubscribers.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update reminder: ${error.message}`);
    },
  });

  // Transform data
  const plans: Plan[] = useMemo(() => {
    if (!plansData?.plans) return [];
    return plansData.plans.map((p: any) => ({
      id: p.id,
      tier: p.tier as PlanTier,
      price: p.price,
      billingCycle: p.billingCycle,
      benefits: p.benefits || [],
      color: planTierConfig[p.tier as PlanTier]?.color || "text-gray-400",
      bgColor: planTierConfig[p.tier as PlanTier]?.bg || "bg-gray-500/10",
      borderColor: planTierConfig[p.tier as PlanTier]?.border || "border-gray-500/30",
    }));
  }, [plansData]);

  const subscribers: Subscriber[] = useMemo(() => {
    if (!subscribersData?.subscribers) return [];
    return subscribersData.subscribers.map((s: any) => ({
      id: s.id,
      customerName: s.customer?.name || "Unknown",
      planTier: s.plan?.tier as PlanTier,
      nextBillingDate: s.nextBillingDate,
      status: s.status as SubscriptionStatus,
      benefitsUsed: s.benefitsUsed || 0,
      benefitsTotal: s.benefitsTotal || 0,
      whatsappReminder: s.whatsappReminder || false,
    }));
  }, [subscribersData]);

  const customers: CustomerOption[] = useMemo(() => {
    if (!customersData?.customers) return [];
    return customersData.customers.map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
    }));
  }, [customersData]);

  // Metrics
  const metrics: ChurnRetentionMetrics = useMemo(() => {
    const active = subscribers.filter((s) => s.status === "active");
    const canceledThisMonth = subscribers.filter((s) => {
      if (s.status !== "canceled") return false;
      const date = new Date(s.nextBillingDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const mrr = active.reduce((sum, s) => {
      const plan = plans.find((p) => p.tier === s.planTier);
      return sum + (plan?.price || 0);
    }, 0);
    return {
      activeCount: active.length,
      canceledThisMonth,
      projectedMRR: mrr,
    };
  }, [subscribers, plans]);

  const filteredCustomers = useMemo(() => {
    if (!searchCustomerTerm) return customers;
    const term = searchCustomerTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) || c.phone.toLowerCase().includes(term)
    );
  }, [customers, searchCustomerTerm]);

  const sortedSubscribers = useMemo(() => {
    return [...subscribers].sort((a, b) => {
      let aVal: any = a[subscriberSortColumn];
      let bVal: any = b[subscriberSortColumn];
      if (subscriberSortColumn === "nextBillingDate") {
        aVal = new Date(a.nextBillingDate).getTime();
        bVal = new Date(b.nextBillingDate).getTime();
      }
      if (aVal < bVal) return subscriberSortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return subscriberSortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [subscribers, subscriberSortColumn, subscriberSortDirection]);

  const handleSubscriberSort = (column: keyof Subscriber) => {
    if (subscriberSortColumn === column) {
      setSubscriberSortDirection(
        subscriberSortDirection === "asc" ? "desc" : "asc"
      );
    } else {
      setSubscriberSortColumn(column);
      setSubscriberSortDirection("asc");
    }
  };

  const handleAssignSubmit = () => {
    if (selectedCustomer && selectedPlan) {
      subscribeMutation.mutate({
        customerId: selectedCustomer,
        planId: selectedPlan,
        paymentMethod,
      });
    }
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    if (confirm("Are you sure you want to cancel this subscription?")) {
      cancelMutation.mutate({ subscriptionId });
    }
  };

  const handleToggleReminder = (subscriberId: string, currentValue: boolean) => {
    toggleReminderMutation.mutate({
      subscriptionId: subscriberId,
      enabled: !currentValue,
    });
  };

  if (plansError || subscribersError) {
    return (
      <div className="h-full flex items-center justify-center text-red-400">
        Error loading subscription data. Please try again.
      </div>
    );
  }

  const isLoading = plansLoading || subscribersLoading;

  return (
    <Tooltip.Provider>
      <div className="h-full flex flex-col space-y-6">
        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900/50 rounded-lg border border-white/5 p-5 animate-pulse"
                >
                  <div className="h-5 w-20 bg-slate-700 rounded mb-3" />
                  <div className="h-8 w-24 bg-slate-700 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-700 rounded" />
                    <div className="h-4 w-3/4 bg-slate-700 rounded" />
                    <div className="h-4 w-1/2 bg-slate-700 rounded" />
                  </div>
                </div>
              ))
            : plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-slate-900/50 rounded-lg border ${plan.borderColor} p-5 flex flex-col`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`text-lg font-medium ${plan.color}`}>
                        {planTierConfig[plan.tier].label}
                      </h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-medium text-white">
                          ₵{plan.price}
                        </span>
                        <span className="text-xs text-slate-400">
                          /{plan.billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onEditPlan?.(plan.id)}
                      className="p-1.5 hover:bg-slate-700 rounded-md transition-colors"
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  <ul className="space-y-2 mb-4 flex-1">
                    {plan.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
        </div>

        {/* Churn/Retention Widget & WhatsApp Toggle */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 bg-slate-900/50 rounded-lg border border-white/5 p-5">
            <h3 className="text-sm font-medium text-white mb-3">
              Churn & Retention
            </h3>
            {isLoading ? (
              <div className="flex justify-around py-4">
                <div className="h-10 w-16 bg-slate-700 rounded animate-pulse" />
                <div className="h-10 w-16 bg-slate-700 rounded animate-pulse" />
                <div className="h-10 w-24 bg-slate-700 rounded animate-pulse" />
              </div>
            ) : (
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <div className="text-2xl font-medium text-white">
                    {metrics.activeCount}
                  </div>
                  <div className="text-xs text-slate-400">Active Subscribers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-medium text-red-400">
                    {metrics.canceledThisMonth}
                  </div>
                  <div className="text-xs text-slate-400">Canceled This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-medium text-green-400">
                    ₵{metrics.projectedMRR.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">Projected MRR</div>
                </div>
              </div>
            )}
          </div>
          <div className="bg-slate-900/50 rounded-lg border border-white/5 p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white mb-1">
                WhatsApp Reminders
              </h3>
              <p className="text-xs text-slate-400">
                Send renewal alerts automatically
              </p>
            </div>
            <Toggle.Root
              defaultPressed
              aria-label="Toggle WhatsApp reminders"
              className="w-11 h-6 bg-slate-700 rounded-full relative transition-colors data-[state=on]:bg-green-600"
            >
              <span className="block w-5 h-5 bg-white rounded-full shadow-sm transition-transform translate-x-0.5 data-[state=on]:translate-x-5" />
            </Toggle.Root>
          </div>
        </div>

        {/* Active Subscribers Table */}
        <div className="flex-1 bg-slate-900/50 rounded-lg border border-white/5 overflow-hidden flex flex-col min-h-0">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-base font-medium text-white">
              Active Subscribers
            </h2>
            <Dialog.Root open={assignModalOpen} onOpenChange={setAssignModalOpen}>
              <Dialog.Trigger asChild>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Assign Plan
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-lg shadow-xl border border-white/10 w-full max-w-lg p-6">
                  <Dialog.Title className="text-lg font-medium text-white mb-4">
                    Assign Plan to Customer
                  </Dialog.Title>
                  <div className="space-y-5">
                    {/* Search Customer */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Customer
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search by name or phone..."
                          value={searchCustomerTerm}
                          onChange={(e) => setSearchCustomerTerm(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      {searchCustomerTerm && (
                        <div className="mt-2 max-h-40 overflow-y-auto bg-slate-900 rounded-md border border-white/10">
                          {filteredCustomers.length === 0 ? (
                            <p className="text-sm text-slate-500 p-3">
                              No customers found
                            </p>
                          ) : (
                            filteredCustomers.map((customer) => (
                              <button
                                key={customer.id}
                                onClick={() => {
                                  setSelectedCustomer(customer.id);
                                  setSearchCustomerTerm("");
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-700 transition-colors"
                              >
                                <span className="text-sm text-white block">
                                  {customer.name}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {customer.phone}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                      {selectedCustomer && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-white bg-blue-600/20 px-2 py-1 rounded">
                            {customers.find((c) => c.id === selectedCustomer)?.name}
                          </span>
                          <button
                            onClick={() => setSelectedCustomer(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Select Plan */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Plan
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {plans.map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`p-3 rounded-md border text-left transition-colors ${
                              selectedPlan === plan.id
                                ? `${plan.borderColor} ${plan.bgColor}`
                                : "border-white/10 bg-slate-900 hover:bg-slate-700"
                            }`}
                          >
                            <span className={`text-sm font-medium ${plan.color}`}>
                              {planTierConfig[plan.tier].label}
                            </span>
                            <span className="text-xs text-slate-400 block">
                              ₵{plan.price}/
                              {plan.billingCycle === "monthly" ? "mo" : "yr"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="mobile_money">Mobile Money</option>
                        <option value="card">Credit/Debit Card</option>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={() => setAssignModalOpen(false)}
                        className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAssignSubmit}
                        disabled={!selectedCustomer || !selectedPlan || subscribeMutation.isLoading}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {subscribeMutation.isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Activating...
                          </>
                        ) : (
                          "Activate Subscription"
                        )}
                      </button>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button className="absolute top-4 right-4 text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>

          <div className="overflow-auto flex-1">
            {subscribersLoading ? (
              <div className="p-8 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-800/50 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-white/10 sticky top-0">
                  <tr>
                    <th
                      className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSubscriberSort("customerName")}
                    >
                      <div className="flex items-center gap-1">
                        Customer
                        {subscriberSortColumn === "customerName" && (
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${
                              subscriberSortDirection === "desc" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th
                      className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSubscriberSort("nextBillingDate")}
                    >
                      <div className="flex items-center gap-1">
                        Next Billing
                        {subscriberSortColumn === "nextBillingDate" && (
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${
                              subscriberSortDirection === "desc" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Benefits
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Reminder
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <Users className="w-12 h-12 mb-3 opacity-50" />
                          <p className="text-sm">No active subscribers found</p>
                          <button
                            onClick={() => setAssignModalOpen(true)}
                            className="mt-3 text-sm text-blue-400 hover:text-blue-300"
                          >
                            Assign Plan to get started
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedSubscribers.map((subscriber) => (
                      <tr
                        key={subscriber.id}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-5 py-4 text-sm text-white">
                          {subscriber.customerName}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-sm ${
                              planTierConfig[subscriber.planTier]?.color || "text-gray-400"
                            }`}
                          >
                            {planTierConfig[subscriber.planTier]?.label || subscriber.planTier}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300">
                          {new Date(subscriber.nextBillingDate).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusConfig[subscriber.status]?.bg || "bg-gray-400/10"
                            } ${statusConfig[subscriber.status]?.color || "text-gray-400"}`}
                          >
                            {statusConfig[subscriber.status]?.label || subscriber.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-700 rounded-full h-1.5">
                              <div
                                className="bg-green-500 h-1.5 rounded-full"
                                style={{
                                  width: `${
                                    subscriber.benefitsTotal > 0
                                      ? (subscriber.benefitsUsed / subscriber.benefitsTotal) * 100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-slate-400">
                              {subscriber.benefitsUsed}/{subscriber.benefitsTotal}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() =>
                              handleToggleReminder(subscriber.id, subscriber.whatsappReminder)
                            }
                            className={`p-1.5 rounded-md transition-colors ${
                              subscriber.whatsappReminder
                                ? "text-green-400 hover:bg-green-500/10"
                                : "text-slate-500 hover:bg-slate-700"
                            }`}
                          >
                            {subscriber.whatsappReminder ? (
                              <Bell className="w-4 h-4" />
                            ) : (
                              <BellOff className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleCancelSubscription(subscriber.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {subscribers.length} subscribers
            </span>
            <div className="flex gap-1">
              <button className="px-3 py-1 text-xs bg-slate-800 text-slate-300 rounded border border-white/10 hover:bg-slate-700">
                Previous
              </button>
              <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                1
              </button>
              <button className="px-3 py-1 text-xs bg-slate-800 text-slate-300 rounded border border-white/10 hover:bg-slate-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default SubscriptionsPage;