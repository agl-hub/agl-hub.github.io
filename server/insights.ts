/**
 * Business Insights Engine
 * Generates trends, action items, best sellers, and performance metrics
 */

export interface Insight {
  id: string;
  type: "positive" | "negative" | "info" | "warning";
  title: string;
  description: string;
  metric?: number;
  trend?: "up" | "down" | "stable";
  actionable?: boolean;
  action?: string;
}

export interface BusinessMetrics {
  dailyRevenueTarget: number;
  dailyRevenue: number;
  revenueProgress: number;
  mechanicEfficiency: {
    mechanicName: string;
    jobsCompleted: number;
    avgTimePerJob: number;
    efficiency: number; // percentage
  }[];
  vehicleTurnaroundTime: {
    average: number; // in hours
    trend: "improving" | "declining";
  };
  bestSellers: {
    productName: string;
    quantity: number;
    revenue: number;
    trend: "up" | "down";
  }[];
  actionItems: Insight[];
}

/**
 * Generate insights from operational data
 */
export function generateInsights(data: any): Insight[] {
  const insights: Insight[] = [];

  // Revenue insights
  if (data.dailyRevenue > data.dailyRevenueTarget) {
    insights.push({
      id: "revenue-positive",
      type: "positive",
      title: "Revenue Target Exceeded",
      description: `Daily revenue of GHS ${data.dailyRevenue} exceeded target of GHS ${data.dailyRevenueTarget}`,
      metric: ((data.dailyRevenue / data.dailyRevenueTarget) * 100 - 100),
      trend: "up",
      actionable: true,
      action: "View detailed breakdown",
    });
  } else if (data.dailyRevenue < data.dailyRevenueTarget * 0.8) {
    insights.push({
      id: "revenue-warning",
      type: "warning",
      title: "Revenue Below Target",
      description: `Daily revenue is only GHS ${data.dailyRevenue}, target is GHS ${data.dailyRevenueTarget}`,
      metric: ((data.dailyRevenue / data.dailyRevenueTarget) * 100),
      trend: "down",
      actionable: true,
      action: "Review sales channels",
    });
  }

  // Mechanic efficiency insights
  if (data.mechanicEfficiency && data.mechanicEfficiency.length > 0) {
    const topMechanic = data.mechanicEfficiency.reduce((prev: any, current: any) =>
      current.efficiency > prev.efficiency ? current : prev
    );

    if (topMechanic.efficiency > 90) {
      insights.push({
        id: "mechanic-top-performer",
        type: "positive",
        title: `${topMechanic.mechanicName} - Top Performer`,
        description: `${topMechanic.mechanicName} has achieved ${topMechanic.efficiency}% efficiency with ${topMechanic.jobsCompleted} jobs completed`,
        metric: topMechanic.efficiency,
        trend: "up",
      });
    }

    const lowPerformer = data.mechanicEfficiency.reduce((prev: any, current: any) =>
      current.efficiency < prev.efficiency ? current : prev
    );

    if (lowPerformer.efficiency < 70) {
      insights.push({
        id: "mechanic-low-performer",
        type: "warning",
        title: `${lowPerformer.mechanicName} - Performance Alert`,
        description: `${lowPerformer.mechanicName} has ${lowPerformer.efficiency}% efficiency. Consider providing support or training.`,
        metric: lowPerformer.efficiency,
        trend: "down",
        actionable: true,
        action: "Review workload",
      });
    }
  }

  // Vehicle turnaround time insights
  if (data.vehicleTurnaroundTime) {
    if (data.vehicleTurnaroundTime.trend === "improving") {
      insights.push({
        id: "turnaround-improving",
        type: "positive",
        title: "Vehicle Turnaround Improving",
        description: `Average turnaround time is improving. Current average: ${data.vehicleTurnaroundTime.average} hours`,
        metric: data.vehicleTurnaroundTime.average,
        trend: "down",
      });
    } else if (data.vehicleTurnaroundTime.trend === "declining") {
      insights.push({
        id: "turnaround-declining",
        type: "warning",
        title: "Vehicle Turnaround Declining",
        description: `Average turnaround time is increasing. Current average: ${data.vehicleTurnaroundTime.average} hours`,
        metric: data.vehicleTurnaroundTime.average,
        trend: "up",
        actionable: true,
        action: "Review workshop capacity",
      });
    }
  }

  // Best sellers insights
  if (data.bestSellers && data.bestSellers.length > 0) {
    const topSeller = data.bestSellers[0];
    insights.push({
      id: "top-seller",
      type: "info",
      title: `Top Seller: ${topSeller.productName}`,
      description: `${topSeller.productName} generated GHS ${topSeller.revenue} in revenue with ${topSeller.quantity} units sold`,
      metric: topSeller.revenue,
      trend: topSeller.trend as "up" | "down",
    });
  }

  return insights;
}

/**
 * Calculate mechanic efficiency metrics
 */
export function calculateMechanicEfficiency(
  mechanicData: any[],
  jobData: any[]
): BusinessMetrics["mechanicEfficiency"] {
  return mechanicData.map((mechanic) => {
    const mechanicJobs = jobData.filter((job) => job.mechanicName === mechanic.name);
    const completedJobs = mechanicJobs.filter((job) => job.status === "Completed");

    const totalTime = completedJobs.reduce((sum, job) => {
      const start = new Date(job.startTime).getTime();
      const end = new Date(job.endTime).getTime();
      return sum + (end - start) / (1000 * 60 * 60); // Convert to hours
    }, 0);

    const avgTime = completedJobs.length > 0 ? totalTime / completedJobs.length : 0;
    const efficiency = (completedJobs.length / mechanicJobs.length) * 100;

    return {
      mechanicName: mechanic.name,
      jobsCompleted: completedJobs.length,
      avgTimePerJob: avgTime,
      efficiency: Math.round(efficiency),
    };
  });
}

/**
 * Calculate vehicle turnaround time
 */
export function calculateTurnaroundTime(jobData: any[]): BusinessMetrics["vehicleTurnaroundTime"] {
  const completedJobs = jobData.filter((job) => job.status === "Completed");

  if (completedJobs.length === 0) {
    return { average: 0, trend: "improving" };
  }

  const turnaroundTimes = completedJobs.map((job) => {
    const start = new Date(job.intakeDate).getTime();
    const end = new Date(job.completionDate).getTime();
    return (end - start) / (1000 * 60 * 60); // Convert to hours
  });

  const average = turnaroundTimes.reduce((a, b) => a + b, 0) / turnaroundTimes.length;

  // Simple trend calculation: compare last 5 with previous 5
  const recent = turnaroundTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const previous = turnaroundTimes.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;

  const trend: "improving" | "declining" = recent < previous ? "improving" : "declining";

  return {
    average: Math.round(average * 10) / 10,
    trend,
  };
}

/**
 * Identify best sellers
 */
export function identifyBestSellers(salesData: any[]): BusinessMetrics["bestSellers"] {
  const productMap = new Map<string, { quantity: number; revenue: number }>();

  salesData.forEach((sale) => {
    const product = sale.partService || "Unknown";
    const quantity = parseInt(sale.quantity) || 1;
    const revenue = parseFloat(sale.amount) || 0;

    if (productMap.has(product)) {
      const existing = productMap.get(product)!;
      existing.quantity += quantity;
      existing.revenue += revenue;
    } else {
      productMap.set(product, { quantity, revenue });
    }
  });

  return Array.from(productMap.entries())
    .map(([name, data]) => ({
      productName: name,
      quantity: data.quantity,
      revenue: data.revenue,
      trend: "up" as const, // Could calculate actual trend with historical data
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

/**
 * Calculate daily revenue target progress
 */
export function calculateRevenueProgress(
  dailyRevenue: number,
  dailyTarget: number
): { progress: number; status: "on-track" | "at-risk" | "exceeded" } {
  const progress = (dailyRevenue / dailyTarget) * 100;

  let status: "on-track" | "at-risk" | "exceeded";
  if (progress >= 100) {
    status = "exceeded";
  } else if (progress >= 80) {
    status = "on-track";
  } else {
    status = "at-risk";
  }

  return { progress: Math.round(progress), status };
}

/**
 * Generate comprehensive business metrics
 */
export function generateBusinessMetrics(data: any): BusinessMetrics {
  const dailyRevenueTarget = 5000; // GHS - configurable
  const dailyRevenue = data.sales?.reduce((sum: number, sale: any) => sum + (parseFloat(sale.amount) || 0), 0) || 0;

  const mechanicEfficiency = calculateMechanicEfficiency(data.staff || [], data.workshop || []);
  const vehicleTurnaroundTime = calculateTurnaroundTime(data.workshop || []);
  const bestSellers = identifyBestSellers(data.sales || []);
  const revenueProgress = calculateRevenueProgress(dailyRevenue, dailyRevenueTarget);

  const actionItems = generateInsights({
    dailyRevenue,
    dailyRevenueTarget,
    mechanicEfficiency,
    vehicleTurnaroundTime,
    bestSellers,
  });

  return {
    dailyRevenueTarget,
    dailyRevenue,
    revenueProgress: revenueProgress.progress,
    mechanicEfficiency,
    vehicleTurnaroundTime,
    bestSellers,
    actionItems,
  };
}
