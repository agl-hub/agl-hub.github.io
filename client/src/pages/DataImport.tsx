import { useState } from "react";
import DashboardNav from "@/components/DashboardNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ImportStatus {
  status: "idle" | "uploading" | "processing" | "success" | "error";
  message: string;
  progress?: number;
}

export default function DataImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>({ status: "idle", message: "" });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls")) {
        setFile(selectedFile);
        setImportStatus({ status: "idle", message: "File selected: " + selectedFile.name });
      } else {
        setImportStatus({
          status: "error",
          message: "Please select a valid Excel file (.xlsx or .xls)",
        });
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setImportStatus({ status: "error", message: "Please select a file first" });
      return;
    }

    setImportStatus({ status: "uploading", message: "Reading file..." });

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContent = e.target?.result as string;
        setImportStatus({ status: "processing", message: "Processing data..." });

        // Call import API
        try {
          const response = await fetch("/api/trpc/import.processExcel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileContent, filename: file.name }),
          });

          if (response.ok) {
            const result = await response.json();
            setImportStatus({
              status: "success",
              message: `Import successful! Processed ${result.recordsImported || 0} records.`,
            });
            setFile(null);
          } else {
            setImportStatus({
              status: "error",
              message: "Import failed. Please check the file format.",
            });
          }
        } catch (error) {
          setImportStatus({
            status: "error",
            message: "Error processing file: " + (error as Error).message,
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setImportStatus({
        status: "error",
        message: "Error reading file: " + (error as Error).message,
      });
    }
  };

  const getStatusIcon = () => {
    switch (importStatus.status) {
      case "success":
        return <CheckCircle className="text-green-600" size={24} />;
      case "error":
        return <AlertCircle className="text-red-600" size={24} />;
      case "uploading":
      case "processing":
        return <Loader2 className="text-blue-600 animate-spin" size={24} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Data Import</h1>

          <Card className="p-8">
            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-500 transition-colors">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Upload Excel File</h2>
                <p className="text-gray-600 mb-4">
                  Select your AGL Master Ops Tracker file (.xlsx or .xls)
                </p>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input">
                  <Button
                    asChild
                    className="bg-red-600 hover:bg-red-700 cursor-pointer"
                  >
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>

              {/* Selected File Info */}
              {file && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Selected:</strong> {file.name}
                  </p>
                  <p className="text-sm text-blue-700">
                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {/* Status Message */}
              {importStatus.message && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg ${
                    importStatus.status === "success"
                      ? "bg-green-50 border border-green-200"
                      : importStatus.status === "error"
                        ? "bg-red-50 border border-red-200"
                        : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  {getStatusIcon()}
                  <div>
                    <p
                      className={`font-medium ${
                        importStatus.status === "success"
                          ? "text-green-900"
                          : importStatus.status === "error"
                            ? "text-red-900"
                            : "text-blue-900"
                      }`}
                    >
                      {importStatus.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Import Button */}
              <Button
                onClick={handleImport}
                disabled={!file || importStatus.status === "uploading" || importStatus.status === "processing"}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2"
              >
                {importStatus.status === "uploading" || importStatus.status === "processing" ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={16} />
                    Processing...
                  </>
                ) : (
                  "Import Data"
                )}
              </Button>

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-slate-900">Import Instructions:</h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Upload your AGL Master Ops Tracker Excel file</li>
                  <li>The system will parse all sheets (Monthly Summary, Sales, Workshop, Staff, Expenses, etc.)</li>
                  <li>Data will be synced to the database for real-time dashboard updates</li>
                  <li>Existing data will be updated, new records will be added</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
