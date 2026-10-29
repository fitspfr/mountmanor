import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  FolderTree,
  Copy,
  Check,
  Download,
  Terminal,
  Server,
  Layers,
  Database,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface BackendFileItem {
  id: string;
  name: string;
  category: string;
  type: string;
  path: string;
  description: string;
}

export const BackendCodeViewer: React.FC = () => {
  const [manifest, setManifest] = useState<BackendFileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<BackendFileItem | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load manifest on mount
  useEffect(() => {
    fetch('/api/v1/backend-files')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setManifest(data.data);
          setSelectedFile(data.data[0]);
        }
      })
      .catch((err) => console.error('Failed to load file manifest', err));
  }, []);

  // Fetch content whenever selected file changes
  useEffect(() => {
    if (!selectedFile) return;

    setLoadingContent(true);
    setCopied(false);
    fetch(`/api/v1/backend-files/content?path=${encodeURIComponent(selectedFile.path)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFileContent(data.data.content);
        } else {
          setFileContent('// Failed to load file content.');
        }
      })
      .catch((err) => {
        console.error('Failed to load file content', err);
        setFileContent('// Error loading file.');
      })
      .finally(() => setLoadingContent(false));
  }, [selectedFile]);

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedFile) return;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Group files by category
  const categories = Array.from(new Set(manifest.map((f) => f.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
            <Server className="w-4 h-4" />
            <span>Backend Code Repository & Architecture Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
            Laravel 11 & Express Backend Codebase
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, inspect, and copy the complete production backend implementation files (Controllers, Middleware, Migrations, Routes & Server).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy File'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: File Tree (Left) + Code Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: File Tree Explorer */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-amber-400" />
              <span>Project Structure</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">{manifest.length} files</span>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat} className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 block">
                  {cat}
                </span>
                <div className="space-y-0.5">
                  {manifest
                    .filter((f) => f.category === cat)
                    .map((file) => {
                      const isSelected = selectedFile?.id === file.id;
                      return (
                        <button
                          key={file.id}
                          onClick={() => setSelectedFile(file)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                            <span className="truncate">{file.name}</span>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-950' : 'text-slate-600'}`} />
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture Note</span>
            </div>
            <p className="leading-relaxed">
              All backend endpoints use the standardized JSON:API envelope format with multi-tenant headers (`X-Tenant-ID`), enabling zero-friction switching between Laravel and Express.
            </p>
          </div>
        </div>

        {/* Right: Code Viewer & Architectural Breakdown */}
        <div className="lg:col-span-8 space-y-4">
          {selectedFile && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {/* File Info Bar */}
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">{selectedFile.name}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 text-[11px]">{selectedFile.path}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>{selectedFile.type.toUpperCase()}</span>
                  <span>·</span>
                  <span className="text-emerald-400">Ready to Deploy</span>
                </div>
              </div>

              {/* Description strip */}
              <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/50 text-xs text-slate-300 flex items-center justify-between">
                <span>{selectedFile.description}</span>
                <span className="text-[11px] font-mono text-slate-500">
                  {fileContent.split('\n').length} lines
                </span>
              </div>

              {/* Code display */}
              <div className="relative">
                {loadingContent ? (
                  <div className="py-24 text-center text-slate-500 text-xs font-mono">
                    Loading file contents...
                  </div>
                ) : (
                  <pre className="p-5 bg-slate-950 text-xs font-mono text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed select-all">
                    <code>{fileContent}</code>
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Implementation Highlights Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <span className="text-amber-400 font-mono font-bold block flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tenant Isolation</span>
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                `TenantResolver` extracts the active hotel property from the HTTP request header (`X-Tenant-ID`) or query param, scoping all queries to that tenant.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <span className="text-amber-400 font-mono font-bold block flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Standardized JSON</span>
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Every endpoint returns standard JSON envelopes (&lbrace; success, status, data, meta &rbrace;), allowing third-party React, Flutter, or iOS developers to handle responses cleanly.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <span className="text-amber-400 font-mono font-bold block flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Instant Migration</span>
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                The migration file (`create_mountmanor_saas_tables.php`) runs out-of-the-box on MySQL or PostgreSQL with foreign key cascade integrity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
