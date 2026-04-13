import { useState, useRef } from 'react';
import { useLayout } from '../components/MainLayout';
import { trpc } from '../lib/trpc';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

export default function ExcelImport() {
  const { showToast } = useLayout();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [importedStats, setImportedStats] = useState<Record<string, number> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importExcel = trpc.import.processExcel.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setImportStatus('success');
        setImportedStats(data.stats || {});
        const totalRecords = Object.values(data.stats || {}).reduce((a, b) => a + b, 0);
        showToast(`Successfully imported ${totalRecords} records`, 'success');
        setFile(null);
      } else {
        setImportStatus('error');
        setErrorMessage(data.message || 'Import failed');
        showToast(`Import failed: ${data.message}`, 'error');
      }
    },
    onError: (error) => {
      setImportStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred');
      showToast(`Import failed: ${error.message}`, 'error');
    },
  });

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const validExtensions = ['.xlsx', '.xls'];
    
    const hasValidExtension = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
    const hasValidType = validTypes.includes(selectedFile.type);

    if (!hasValidExtension && !hasValidType) {
      showToast('Please select a valid Excel file (.xlsx or .xls)', 'error');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      showToast('File size exceeds 50MB limit', 'error');
      return;
    }

    setFile(selectedFile);
    setImportStatus('idle');
    setErrorMessage('');
    setImportedStats(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      showToast('Please select a file first', 'error');
      return;
    }

    setImportStatus('uploading');
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const base64 = arrayBufferToBase64(arrayBuffer);
        
        setImportStatus('processing');
        importExcel.mutate({
          fileContent: base64,
          filename: file.name,
        });
      };
      reader.onerror = () => {
        setImportStatus('error');
        setErrorMessage('Failed to read file');
        showToast('Failed to read file', 'error');
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setImportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      showToast('Error reading file', 'error');
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImportStatus('idle');
    setErrorMessage('');
    setImportedStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = () => {
    switch (importStatus) {
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={24} />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="text-blue-500 animate-spin" size={24} />;
      default:
        return <FileSpreadsheet className="text-gray-400" size={48} />;
    }
  };

  const supportedSheets = [
    { name: 'Monthly Summary', icon: '📊', color: '#1ABC9C' },
    { name: 'Sales & Customer Log', icon: '💰', color: '#E74C3C' },
    { name: 'Workshop Daily Log', icon: '⚙', color: '#F39C12' },
    { name: 'Staff Clock-In', icon: '👥', color: '#3498DB' },
    { name: 'Expense Log', icon: '📋', color: '#9B59B6' },
    { name: 'Purchase Orders', icon: '📦', color: '#16A085' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          📥 Excel Import
        </h1>
        <p style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
          Import data from your AGL Master Ops Tracker Excel file
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-4" style={{ marginBottom: '16px' }}>
        {supportedSheets.slice(0, 4).map(sheet => (
          <div key={sheet.name} className="card kpi-card" style={{ borderLeft: `3px solid ${sheet.color}` }}>
            <div className="kpi-label">{sheet.icon} {sheet.name}</div>
            <div className="kpi-value" style={{ fontSize: '14px' }}>
              {importedStats ? (importedStats[sheet.name.toLowerCase().replace(/ /g, '')] || 0).toLocaleString() : '-'}
            </div>
            <div className="kpi-sub">Records imported</div>
          </div>
        ))}
      </div>

      {/* Main Import Card */}
      <div className="card" style={{ padding: 0 }}>
        {/* Drop Zone */}
        <div
          style={{
            padding: '32px',
            border: `2px dashed ${dragActive ? '#1ABC9C' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
            background: dragActive ? 'rgba(26,188,156,0.05)' : 'transparent',
            transition: 'all 0.2s ease',
            marginBottom: '16px',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div style={{ marginBottom: '12px' }}>
            {importStatus === 'idle' || importStatus === 'uploading' || importStatus === 'processing' ? (
              <Upload size={48} style={{ color: 'var(--text-dim)', marginBottom: '8px' }} />
            ) : (
              getStatusIcon()
            )}
          </div>
          
          {file ? (
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                {file.name}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '12px' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {importStatus === 'idle' && (
                <button
                  onClick={handleRemoveFile}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    color: '#E74C3C',
                    background: 'rgba(231,76,60,0.1)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <X size={12} /> Remove
                </button>
              )}
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                Drop your Excel file here
              </h3>
              <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '12px' }}>
                or click to browse (.xlsx, .xls - max 50MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleInputChange}
                style={{ display: 'none' }}
                id="excel-file-input"
              />
              <label htmlFor="excel-file-input">
                <span
                  style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#fff',
                    background: '#1ABC9C',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  Choose File
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Status Message */}
        {importStatus !== 'idle' && importStatus !== 'uploading' && (
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              background: importStatus === 'success' 
                ? 'rgba(26,188,156,0.1)' 
                : importStatus === 'error'
                ? 'rgba(231,76,60,0.1)'
                : 'rgba(52,152,219,0.1)',
              border: `1px solid ${importStatus === 'success'
                ? 'rgba(26,188,156,0.2)'
                : importStatus === 'error'
                ? 'rgba(231,76,60,0.2)'
                : 'rgba(52,152,219,0.2)'}`,
            }}
          >
            {getStatusIcon()}
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: importStatus === 'success'
                    ? '#1ABC9C'
                    : importStatus === 'error'
                    ? '#E74C3C'
                    : '#3498DB',
                  marginBottom: '4px',
                }}
              >
                {importStatus === 'processing' && 'Processing your file...'}
                {importStatus === 'success' && 'Import completed successfully!'}
                {importStatus === 'error' && errorMessage}
              </p>
              {importStatus === 'success' && importedStats && (
                <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
                  {Object.entries(importedStats).map(([key, value]) => (
                    <span key={key} style={{ marginRight: '12px' }}>
                      {key}: {value.toLocaleString()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Import Button */}
        <button
          onClick={handleImport}
          disabled={!file || importStatus === 'uploading' || importStatus === 'processing'}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#fff',
            background: !file || importStatus === 'uploading' || importStatus === 'processing'
              ? 'rgba(255,255,255,0.1)'
              : '#1ABC9C',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: !file || importStatus === 'uploading' || importStatus === 'processing'
              ? 'not-allowed'
              : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          {importStatus === 'uploading' || importStatus === 'processing' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {importStatus === 'uploading' ? 'Uploading...' : 'Processing...'}
            </>
          ) : (
            '📥 Import Data'
          )}
        </button>

        {/* Supported Sheets */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
            Supported Sheets
          </h4>
          <div className="grid grid-3" style={{ gap: '6px' }}>
            {supportedSheets.map(sheet => (
              <div
                key={sheet.name}
                style={{
                  padding: '8px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderLeft: `2px solid ${sheet.color}`,
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#fff' }}>
                  {sheet.icon} {sheet.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <h4 style={{ fontSize: '11px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
            📝 Import Instructions
          </h4>
          <ul style={{ fontSize: '9px', color: 'var(--text-dim)', lineHeight: 1.8, paddingLeft: '14px', margin: 0 }}>
            <li>Export your AGL Master Ops Tracker as an Excel file (.xlsx or .xls)</li>
            <li>Ensure all sheet names match exactly (see supported sheets above)</li>
            <li>Existing records will be updated, new records will be added</li>
            <li>Large files may take a few moments to process</li>
            <li>Maximum file size: 50MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
