import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  CalendarDays,
  DollarSign,
  Loader2,
  Megaphone,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

interface ExpenseLine {
  id: string;
  category: string;
  amount: number;
}

const aglThemeVars: React.CSSProperties = {
  "--agl-primary": "#dc2626",
  "--agl-primary-hover": "#b91c1c",
  "--agl-secondary": "#991b1b",
  "--agl-accent": "#f59e0b",
  "--agl-bg-dark": "#0f172a",
  "--agl-bg-card": "#1e293b",
  "--agl-bg-elevated": "#334155",
  "--agl-text": "#f1f5f9",
  "--agl-text-muted": "#94a3b8",
  "--agl-border": "rgba(255,255,255,0.08)",
  "--agl-success": "#22c55e",
  "--agl-warning": "#f59e0b",
  "--agl-danger": "#ef4444",
  "--agl-info": "#3b82f6",
} as React.CSSProperties;

function formatGhs(value: number): string {
  return `GHS ${value.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function AiWidget({ warningMessage }: { warningMessage: string }) {
  return (
    <div className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[var(--agl-accent)] mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[var(--agl-text)]">{warningMessage}</p>
          <p className="text-xs text-[var(--agl-text-muted)] mt-1">
            Suggested action: Pause low-conversion campaign and shift budget to WhatsApp conversion funnel.
          </p>
          <button className="mt-2 text-xs bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-3 py-1 rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]">
            Pause Campaign
          </button>
        </div>
      </div>
    </div>
  );
}

export const FinanceDashboard: React.FC = () => {
  const utils = trpc.useUtils();

  const [addExpenseOpen, setAddExpenseOpen] = React.useState(false);
  const [category, setCategory] = React.useState("Operations");
  const [amount, setAmount] = React.useState<number>(0);
  const [description, setDescription] = React.useState("");

  const defaultRange = React.useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, []);

  const salesQuery = trpc.finance.dailySales.useQuery(defaultRange);
  const expensesQuery = trpc.finance.expenseReport.useQuery(defaultRange);
  const roiQuery = trpc.finance.marketingROI.useQuery(defaultRange);

  const addTransactionMutation = trpc.finance.addTransaction.useMutation({
    onSuccess: () => {
      void utils.finance.expenseReport.invalidate();
      void utils.finance.dailySales.invalidate();
      setAddExpenseOpen(false);
      setCategory("Operations");
      setAmount(0);
      setDescription("");
      toast.success("Expense recorded");
    },
    onError: (error) => toast.error(`Failed to save expense: ${error.message}`),
  });

  const totalSales = salesQuery.data?.data?.grandTotal ?? 0;
  const paymentBreakdown = salesQuery.data?.data?.breakdown ?? [];
  const totalExpenses = expensesQuery.data?.data?.totalExpenses ?? 0;

  const expensesByCategory: ExpenseLine[] = React.useMemo(() => {
    const rows = expensesQuery.data?.data?.expenses ?? [];
    const grouped = new Map<string, number>();
    rows.forEach((row) => {
      const key = row.description || "Uncategorized";
      grouped.set(key, (grouped.get(key) ?? 0) + Number(row.amount ?? 0));
    });
    return Array.from(grouped.entries()).map(([key, value], index) => ({
      id: `expense-${index}`,
      category: key,
      amount: value,
    }));
  }, [expensesQuery.data]);

  const campaigns = roiQuery.data?.data?.campaigns ?? [];
  const flaggedCampaigns = campaigns.filter((campaign) => campaign.roi < 0);
  const warningMessage =
    flaggedCampaigns.length > 0
      ? `Medium: ${flaggedCampaigns[0].campaignName} spent ${formatGhs(flaggedCampaigns[0].spend)} with negative ROI (${flaggedCampaigns[0].roi}%).`
      : "Medium: Facebook ads spent GHS 500.00 with 0 conversions this week.";

  const netPosition = totalSales - totalExpenses;
  const isLoading = salesQuery.isLoading || expensesQuery.isLoading || roiQuery.isLoading;
  const hasError = salesQuery.error || expensesQuery.error || roiQuery.error;

  const submitExpense = React.useCallback(() => {
    if (!description.trim() || amount <= 0) {
      toast.error("Enter description and amount");
      return;
    }
    addTransactionMutation.mutate({
      type: "expense",
      amount,
      description: `${category}: ${description.trim()}`,
      date: new Date().toISOString(),
      paymentMethod: "cash",
    });
  }, [addTransactionMutation, amount, category, description]);

  return (
    <main className="min-h-full bg-[var(--agl-bg-dark)] text-[var(--agl-text)] p-6 space-y-6" style={aglThemeVars}>
      <header className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-base md:text-xl font-semibold">Finance Dashboard</h1>
            <p className="text-sm text-[var(--agl-text-muted)]">
              Sales summary, expense visibility, campaign ROI, and fund-waste alerts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddExpenseOpen(true)}
            className="bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
          >
            Add Expense
          </button>
        </div>
      </header>

      <AiWidget warningMessage={warningMessage} />

      {hasError ? (
        <section className="bg-[var(--agl-bg-card)] border border-[var(--agl-danger)]/50 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--agl-danger)]" />
            <div>
              <p className="text-sm font-medium">Failed to load finance data</p>
              <p className="text-xs text-[var(--agl-text-muted)]">{hasError.message}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={`finance-skeleton-${idx}`} className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg animate-pulse h-28" />
          ))
        ) : (
          <>
            <article className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
              <p className="text-xs text-[var(--agl-text-muted)] mb-1">Total Revenue</p>
              <p className="text-xl font-semibold">{formatGhs(totalSales)}</p>
              <div className="mt-2 text-xs inline-flex items-center gap-1 text-[var(--agl-success)]">
                <TrendingUp className="h-3.5 w-3.5" />
                Income trend positive
              </div>
            </article>
            <article className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
              <p className="text-xs text-[var(--agl-text-muted)] mb-1">Total Expenses</p>
              <p className="text-xl font-semibold">{formatGhs(totalExpenses)}</p>
              <div className="mt-2 text-xs inline-flex items-center gap-1 text-[var(--agl-danger)]">
                <TrendingDown className="h-3.5 w-3.5" />
                Monitor outflow
              </div>
            </article>
            <article className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
              <p className="text-xs text-[var(--agl-text-muted)] mb-1">Net Position</p>
              <p className={`text-xl font-semibold ${netPosition >= 0 ? "text-[var(--agl-success)]" : "text-[var(--agl-danger)]"}`}>
                {formatGhs(netPosition)}
              </p>
              <div className="mt-2 text-xs inline-flex items-center gap-1 text-[var(--agl-text-muted)]">
                <Wallet className="h-3.5 w-3.5" />
                Live operating margin
              </div>
            </article>
            <article className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
              <p className="text-xs text-[var(--agl-text-muted)] mb-1">Flagged Campaigns</p>
              <p className="text-xl font-semibold">{flaggedCampaigns.length}</p>
              <div className="mt-2 text-xs inline-flex items-center gap-1 text-[var(--agl-warning)]">
                <Megaphone className="h-3.5 w-3.5" />
                Low conversion spend
              </div>
            </article>
          </>
        )}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <article className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
          <h2 className="text-base font-semibold mb-3">Payment Breakdown</h2>
          <div className="space-y-2">
            {paymentBreakdown.length === 0 ? (
              <p className="text-sm text-[var(--agl-text-muted)]">No payment records available.</p>
            ) : (
              paymentBreakdown.map((row, idx) => (
                <div key={`payment-${idx}`} className="flex items-center justify-between border border-[var(--agl-border)] rounded-lg p-2">
                  <span className="text-sm capitalize">{row.paymentMethod?.replace("_", " ")}</span>
                  <span className="text-sm text-[var(--agl-text-muted)]">{formatGhs(Number(row.total ?? 0))}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
          <h2 className="text-base font-semibold mb-3">Expense Tracker</h2>
          <div className="space-y-2">
            {expensesByCategory.length === 0 ? (
              <p className="text-sm text-[var(--agl-text-muted)]">No expenses captured for this period.</p>
            ) : (
              expensesByCategory.slice(0, 8).map((line) => (
                <div key={line.id} className="flex items-center justify-between border border-[var(--agl-border)] rounded-lg p-2">
                  <span className="text-sm">{line.category}</span>
                  <span className="text-sm text-[var(--agl-text-muted)]">{formatGhs(line.amount)}</span>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
        <h2 className="text-base font-semibold mb-3">Marketing ROI & Fund Waste Alerts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--agl-border)] text-[var(--agl-text-muted)]">
                <th scope="col" className="text-left py-2 px-3 font-medium">Campaign</th>
                <th scope="col" className="text-left py-2 px-3 font-medium">Spend</th>
                <th scope="col" className="text-left py-2 px-3 font-medium">Revenue</th>
                <th scope="col" className="text-left py-2 px-3 font-medium">ROI</th>
                <th scope="col" className="text-left py-2 px-3 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[var(--agl-text-muted)]">
                    <CalendarDays className="h-5 w-5 mx-auto mb-2" />
                    No campaign data for this date range.
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign, index) => (
                  <tr key={`${campaign.campaignName}-${index}`} className={`${index % 2 === 0 ? "bg-transparent" : "bg-[var(--agl-bg-elevated)]/20"} border-b border-[var(--agl-border)] hover:bg-[var(--agl-bg-elevated)]/40`}>
                    <td className="py-2 px-3">{campaign.campaignName}</td>
                    <td className="py-2 px-3">{formatGhs(campaign.spend)}</td>
                    <td className="py-2 px-3">{formatGhs(campaign.revenue)}</td>
                    <td className={`py-2 px-3 ${campaign.roi >= 0 ? "text-[var(--agl-success)]" : "text-[var(--agl-danger)]"}`}>
                      {campaign.roi}%
                    </td>
                    <td className="py-2 px-3">
                      {campaign.roi < 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--agl-danger)]/20 text-[var(--agl-danger)]">
                          Waste Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--agl-success)]/20 text-[var(--agl-success)]">
                          Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog.Root open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-[var(--agl-bg-card)] border border-[var(--agl-border)] rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Dialog.Title className="text-base font-semibold">Add Expense</Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close expense modal"
                  className="p-1 rounded-md hover:bg-[var(--agl-bg-elevated)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--agl-text-muted)] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full bg-[var(--agl-bg-elevated)] border border-[var(--agl-border)] rounded-lg px-3 py-2 text-[var(--agl-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                >
                  <option>Operations</option>
                  <option>Marketing</option>
                  <option>Payroll</option>
                  <option>Utilities</option>
                  <option>Inventory</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[var(--agl-text-muted)] mb-1">Amount</label>
                <input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  className="w-full bg-[var(--agl-bg-elevated)] border border-[var(--agl-border)] rounded-lg px-3 py-2 text-[var(--agl-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--agl-text-muted)] mb-1">Description</label>
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full bg-[var(--agl-bg-elevated)] border border-[var(--agl-border)] rounded-lg px-3 py-2 text-[var(--agl-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddExpenseOpen(false)}
                className="bg-[var(--agl-bg-elevated)] hover:bg-[var(--agl-border)] text-[var(--agl-text)] px-4 py-2 rounded-lg transition text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitExpense}
                disabled={addTransactionMutation.isPending}
                className="bg-[var(--agl-primary)] hover:bg-[var(--agl-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition text-sm inline-flex items-center gap-2 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--agl-primary)]"
              >
                {addTransactionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PiggyBank className="h-4 w-4" />}
                Save Expense
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
};

export default FinanceDashboard;