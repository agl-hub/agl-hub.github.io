import { useMemo } from "react";
import { getData, Sale, Expense, PurchaseOrder } from "./dataStore";

export interface PeriodBounds { from: string; to: string; label: string }

export function getPeriodBounds(preset: string, dateFrom?: string, dateTo?: string): PeriodBounds {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = fmt(now);

  if (preset === "today") {
    return { from: today, to: today, label: "Today" };
  }
  if (preset === "week") {
    const day = now.getDay(); // 0=Sun
    const mon = new Date(now); mon.setDate(now.getDate() - ((day + 6) % 7));
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return { from: fmt(mon), to: fmt(sun), label: "This Week" };
  }
  if (preset === "month") {
    const from = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
    return { from, to: today, label: "This Month" };
  }
  if (preset === "custom" && dateFrom && dateTo) {
    return { from: dateFrom, to: dateTo, label: `${dateFrom} – ${dateTo}` };
  }
  // Default: all time
  return { from: "2000-01-01", to: "2099-12-31", label: "All Time" };
}

export function filterByPeriod<T extends { date: string }>(items: T[], bounds: PeriodBounds): T[] {
  return items.filter(i => i.date >= bounds.from && i.date <= bounds.to);
}

export function usePeriodData(filterState: { preset: string; dateFrom: string; dateTo: string; staff: string; channel: string; payment: string }) {
  const data = getData();
  const bounds = useMemo(
    () => getPeriodBounds(filterState.preset, filterState.dateFrom, filterState.dateTo),
    [filterState.preset, filterState.dateFrom, filterState.dateTo]
  );

  const sales: Sale[] = useMemo(() => {
    let s = filterByPeriod(data.sales, bounds);
    if (filterState.staff) s = s.filter(x => x.rep === filterState.staff);
    if (filterState.channel) s = s.filter(x => x.channel === filterState.channel);
    if (filterState.payment) s = s.filter(x => x.payment === filterState.payment);
    return s.sort((a, b) => `${b.date} ${b.time ?? ""}`.localeCompare(`${a.date} ${a.time ?? ""}`));
  }, [data.sales, bounds, filterState.staff, filterState.channel, filterState.payment]);

  const expenses: Expense[] = useMemo(
    () => filterByPeriod(data.expenses, bounds),
    [data.expenses, bounds]
  );

  const purchaseOrders: PurchaseOrder[] = useMemo(
    () => filterByPeriod(data.purchaseOrders, bounds),
    [data.purchaseOrders, bounds]
  );

  const revenue = useMemo(() => sales.reduce((s, x) => s + x.total, 0), [sales]);
  const expenseTotal = useMemo(() => expenses.reduce((s, x) => s + x.amount, 0), [expenses]);
  const poTotal = useMemo(() => purchaseOrders.reduce((s, x) => s + x.amount, 0), [purchaseOrders]);
  const netProfit = revenue - expenseTotal - poTotal;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // Payment breakdown
  const byPayment = useMemo(() => {
    const m: Record<string, number> = {};
    sales.forEach(s => { m[s.payment] = (m[s.payment] || 0) + s.total; });
    return m;
  }, [sales]);

  // Channel breakdown
  const byChannel = useMemo(() => {
    const m: Record<string, number> = {};
    sales.forEach(s => { m[s.channel] = (m[s.channel] || 0) + s.total; });
    return m;
  }, [sales]);

  // Daily revenue
  const byDate = useMemo(() => {
    const m: Record<string, number> = {};
    sales.forEach(s => { m[s.date] = (m[s.date] || 0) + s.total; });
    return m;
  }, [sales]);

  // By rep
  const byRep = useMemo(() => {
    const m: Record<string, number> = {};
    sales.forEach(s => { m[s.rep] = (m[s.rep] || 0) + s.total; });
    return m;
  }, [sales]);

  // By product
  const byProduct = useMemo(() => {
    const m: Record<string, number> = {};
    sales.forEach(s => { m[s.item] = (m[s.item] || 0) + s.total; });
    return m;
  }, [sales]);

  return {
    data,
    bounds,
    sales,
    expenses,
    purchaseOrders,
    revenue,
    expenseTotal,
    poTotal,
    netProfit,
    margin,
    byPayment,
    byChannel,
    byDate,
    byRep,
    byProduct,
  };
}
