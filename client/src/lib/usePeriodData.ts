import { useMemo, useState, useEffect } from "react";
import { getData, Sale, Expense, PurchaseOrder } from "./dataStore";

export interface PeriodBounds { from: string; to: string; label: string }

export function getPeriodBounds(preset: string, dateFrom?: string, dateTo?: string): PeriodBounds {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = fmt(now);
  if (preset === "today") return { from: today, to: today, label: "Today" };
  if (preset === "week") {
    const day = now.getDay();
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
  return { from: "2000-01-01", to: "2099-12-31", label: "All Time" };
}

export function filterByPeriod<T extends { date: string }>(items: T[], bounds: PeriodBounds): T[] {
  return items.filter(i => i.date >= bounds.from && i.date <= bounds.to);
}

/** Hook that re-renders when dataStore changes (snapshot import, form submits, etc.) */
export function useDataRefresh() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    // Listen for storage events (cross-tab and from snapshot import in main.tsx)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'agl_ops_v2') setTick(t => t + 1);
    };
    window.addEventListener('storage', onStorage);
    // Poll after 800ms to catch the synchronous auto-import that fires before React mounts
    const t1 = setTimeout(() => setTick(t => t + 1), 800);
    const t2 = setTimeout(() => setTick(t => t + 1), 2000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  return tick;
}

export function usePeriodData(filterState: {
  preset: string; dateFrom: string; dateTo: string;
  staff: string; channel: string; payment: string;
}) {
  const refresh = useDataRefresh();
  const data = useMemo(() => getData(), [refresh]);

  const bounds = useMemo(
    () => getPeriodBounds(filterState.preset, filterState.dateFrom, filterState.dateTo),
    [filterState.preset, filterState.dateFrom, filterState.dateTo]
  );

  const sales: Sale[] = useMemo(() => {
    let s = filterByPeriod(data.sales, bounds);
    if (filterState.staff) s = s.filter(x => x.rep === filterState.staff);
    if (filterState.channel) s = s.filter(x => x.channel === filterState.channel);
    if (filterState.payment) s = s.filter(x => x.payment === filterState.payment);
    return s.sort((a, b) => `${b.date}${b.time ?? ""}`.localeCompare(`${a.date}${a.time ?? ""}`));
  }, [data.sales, bounds, filterState.staff, filterState.channel, filterState.payment, refresh]);

  const expenses: Expense[] = useMemo(
    () => filterByPeriod(data.expenses, bounds),
    [data.expenses, bounds, refresh]
  );

  const purchaseOrders: PurchaseOrder[] = useMemo(
    () => filterByPeriod(data.purchaseOrders, bounds),
    [data.purchaseOrders, bounds, refresh]
  );

  // Revenue uses sale.total
  const revenue = useMemo(() => sales.reduce((s, x) => s + (Number(x.total) || 0), 0), [sales]);
  const expenseTotal = useMemo(() => expenses.reduce((s, x) => s + (x.amount ?? 0), 0), [expenses]);
  const poTotal = useMemo(() => purchaseOrders.reduce((s, x) => s + (x.amount ?? 0), 0), [purchaseOrders]);
  const netProfit = revenue - expenseTotal - poTotal;
  const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // Array-based breakdowns for Recharts
  const byPayment = useMemo(() => {
    const m: Record<string, number> = {};
    sales.forEach(s => {
      const key = s.payment || 'Unknown';
      m[key] = (m[key] || 0) + s.total;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [sales]);

  const byChannel = useMemo(() => {
    const m: Record<string, number> = {};
    sales.forEach(s => {
      const key = s.channel || 'Direct';
      m[key] = (m[key] || 0) + s.total;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [sales]);

  const byDate = useMemo(() => {
    const m: Record<string, number> = {};
    sales.forEach(s => { m[s.date] = (m[s.date] || 0) + s.total; });
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b)).map(([date, revenue]) => ({ date, revenue }));
  }, [sales]);

  const byRep = useMemo(() => {
    const m: Record<string, { revenue: number; count: number }> = {};
    sales.forEach(s => {
      const rep = s.rep || 'Unknown';
      if (!m[rep]) m[rep] = { revenue: 0, count: 0 };
      m[rep].revenue += s.total;
      m[rep].count++;
    });
    return Object.entries(m).map(([rep, v]) => ({ rep, ...v })).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  const byProduct = useMemo(() => {
    const m: Record<string, { revenue: number; count: number }> = {};
    sales.forEach(s => {
      const item = s.item || 'Unknown';
      if (!m[item]) m[item] = { revenue: 0, count: 0 };
      m[item].revenue += s.total;
      m[item].count++;
    });
    return Object.entries(m).map(([item, v]) => ({ item, ...v })).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  const topProducts = useMemo(() => byProduct.slice(0, 10), [byProduct]);

  return {
    data, bounds, sales, expenses, purchaseOrders,
    revenue, expenseTotal, poTotal, netProfit, margin,
    byPayment, byChannel, byDate, byRep, byProduct, topProducts,
    refresh,
  };
}
