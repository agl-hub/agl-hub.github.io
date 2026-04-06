/**
 * Export utilities for CSV and Excel formats
 */

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
}

export function exportToExcel(data: any[], filename: string) {
  // For now, we'll export as CSV with .xlsx extension
  // For proper Excel support, you'd need to use a library like xlsx
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.xlsx`;
  link.click();
}

export function formatDateForExport(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US");
}

export function formatCurrencyForExport(amount: number | string | null | undefined): string {
  if (!amount) return "0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(2);
}
