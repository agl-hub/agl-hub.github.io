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

export async function exportToExcel(data: any[], filename: string, sheetName = "Sheet1") {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Print a DOM element to PDF via the browser's print dialog.
 * Pass the id of the element you want printed.
 */
export function printElementToPDF(elementId: string, title = "AGL Report") {
  const el = document.getElementById(elementId);
  if (!el) {
    alert("Report content not found");
    return;
  }
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return;
  // Copy stylesheets so the printed view matches
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((n) => n.outerHTML)
    .join("");
  win.document.write(`<!doctype html><html><head><title>${title}</title>${styles}
<style>
  @page { size: A4; margin: 14mm; }
  body { background: #fff; color: #000; font-family: system-ui, sans-serif; }
  .no-print { display: none !important; }
</style>
</head><body>${el.outerHTML}</body></html>`);
  win.document.close();
  win.focus();
  // Give styles a tick to load
  setTimeout(() => {
    win.print();
    win.close();
  }, 300);
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
