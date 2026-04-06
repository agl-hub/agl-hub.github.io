import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

interface Props {
  /**
   * Filter alerts to show only those of certain categories.
   * If omitted, shows all alerts.
   */
  categories?: ("finance" | "workshop" | "staff" | "inventory" | "sales")[];
  /** Show the trend strip. Default true. */
  showTrends?: boolean;
  /** Max alerts to show. Default 3. */
  maxAlerts?: number;
}

export default function LiveInsightsBanner({
  categories,
  showTrends = true,
  maxAlerts = 3,
}: Props) {
  const { data, isLoading } = trpc.sheets.insights.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="card" style={{ padding: 12, fontSize: 12, opacity: 0.7 }}>
        Loading live insights…
      </div>
    );
  }

  if (!data?.success || !data.metrics) return null;
  const m = data.metrics;
  const alerts = categories
    ? m.alerts.filter((a) => categories.includes(a.category as any))
    : m.alerts;

  const TrendIcon = ({ direction }: { direction: "up" | "down" | "flat" }) =>
    direction === "up" ? (
      <TrendingUp size={14} color="#10b981" />
    ) : direction === "down" ? (
      <TrendingDown size={14} color="#ef4444" />
    ) : (
      <Minus size={14} color="#9ca3af" />
    );

  return (
    <div className="card" style={{ padding: 12, marginBottom: 12 }}>
      {showTrends && (
        <div style={{ display: "flex", gap: 16, marginBottom: alerts.length ? 10 : 0, flexWrap: "wrap" }}>
          {(["revenue", "expenses", "sales"] as const).map((k) => {
            const t = m.trends[k];
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                <span style={{ opacity: 0.7, textTransform: "capitalize" }}>{k}:</span>
                <TrendIcon direction={t.direction} />
                <span style={{ fontWeight: 700 }}>
                  {t.deltaPct > 0 ? "+" : ""}
                  {t.deltaPct}%
                </span>
                <span style={{ opacity: 0.5 }}>14d</span>
              </div>
            );
          })}
        </div>
      )}

      {alerts.slice(0, maxAlerts).map((a) => (
        <div
          key={a.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "6px 8px",
            marginTop: 4,
            borderRadius: 4,
            background: a.severity === "critical" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
            border: `1px solid ${a.severity === "critical" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
            fontSize: 11,
          }}
        >
          <AlertTriangle size={12} color={a.severity === "critical" ? "#ef4444" : "#f59e0b"} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{a.title}</div>
            <div style={{ opacity: 0.8 }}>{a.detail}</div>
          </div>
          {a.recommendedAction && (
            <span style={{ opacity: 0.7, fontStyle: "italic" }}>{a.recommendedAction}</span>
          )}
        </div>
      ))}
    </div>
  );
}
