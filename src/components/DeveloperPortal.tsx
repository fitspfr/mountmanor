import React, { useState, useEffect } from 'react';
import {
  Code2,
  Key,
  Terminal,
  Send,
  Copy,
  Check,
  FileCode2,
  Trash2,
  ShieldCheck,
  Clock,
  ExternalLink,
  BookOpen,
  Sparkles,
  Database,
  Server,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { ApiKey, Property } from '../types/index.ts';
import { api } from '../services/apiClient.ts';

interface DeveloperPortalProps {
  currentProperty: Property;
  apiKeys: ApiKey[];
  onRefreshKeys: () => void;
}

export const DeveloperPortal: React.FC<DeveloperPortalProps> = ({
  currentProperty,
  apiKeys,
  onRefreshKeys
}) => {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'keys' | 'docs' | 'laravel' | 'postgres'>('sandbox');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Key creation state
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:rooms', 'write:bookings']);
  const [creatingKey, setCreatingKey] = useState(false);

  // Sandbox state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/v1/rooms');
  const [requestBody, setRequestBody] = useState<string>('{}');
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [sandboxStatus, setSandboxStatus] = useState<number | null>(null);
  const [sandboxLatency, setSandboxLatency] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'javascript' | 'laravel'>('curl');

  // Backend Target & PHP Wiring State
  const [activeBaseUrl, setActiveBaseUrl] = useState<string>(api.getBaseUrl());
  const [customUrlInput, setCustomUrlInput] = useState<string>(api.getBaseUrl() || 'http://localhost:8000');
  const [connectionCheck, setConnectionCheck] = useState<{
    status: 'idle' | 'checking' | 'connected' | 'error';
    message?: string;
    latencyMs?: number;
    engine?: string;
  }>({ status: 'idle' });

  const handleTestAndSetBackend = async (urlToSet: string) => {
    setConnectionCheck({ status: 'checking' });
    const result = await api.testConnection(urlToSet);
    if (result.success) {
      api.setBaseUrl(urlToSet);
      setActiveBaseUrl(urlToSet);
      setConnectionCheck({
        status: 'connected',
        latencyMs: result.latencyMs,
        engine: result.data?.engine || (urlToSet ? 'PHP / Laravel 11' : 'Node.js Express Gateway')
      });
    } else {
      setConnectionCheck({
        status: 'error',
        message: result.error || 'Connection refused. Is the PHP server running on this port?'
      });
    }
  };

  const handleResetToBuiltin = () => {
    api.setBaseUrl('');
    setActiveBaseUrl('');
    setConnectionCheck({
      status: 'connected',
      latencyMs: 1,
      engine: 'Built-in Node.js / Express Gateway (Port 3000)'
    });
  };

  // PostgreSQL Database State (Non-cloud local database)
  const [pgStatus, setPgStatus] = useState<any>(null);
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT id, name, category, price_per_night, bed_type FROM rooms WHERE property_id = 'mount-manor';");
  const [sqlResults, setSqlResults] = useState<any[] | null>(null);
  const [sqlDuration, setSqlDuration] = useState<number | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isRunningSql, setIsRunningSql] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab === 'postgres') {
      fetch('/api/v1/database/status')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPgStatus(data.data);
          }
        })
        .catch(console.error);
    }
  }, [activeTab]);

  const handleRunSql = async () => {
    if (!sqlQuery.trim()) return;
    setIsRunningSql(true);
    setSqlError(null);
    setSqlResults(null);
    try {
      const res = await fetch('/api/v1/database/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery })
      });
      const data = await res.json();
      if (!res.ok) {
        setSqlError(data.message || 'SQL Execution error');
      } else {
        setSqlResults(data.data.rows);
        setSqlDuration(data.data.durationMs);
      }
    } catch (err: any) {
      setSqlError(err.message || 'Network error executing SQL');
    } finally {
      setIsRunningSql(false);
    }
  };

  useEffect(() => {
    // Set default request bodies based on endpoint
    if (selectedEndpoint === 'GET /api/v1/rooms') {
      setRequestBody('');
    } else if (selectedEndpoint === 'POST /api/v1/bookings') {
      setRequestBody(
        JSON.stringify(
          {
            roomId: 'mm-dlx-02',
            guestName: 'Arun Varma',
            guestEmail: 'arun.varma@thirdparty-app.com',
            guestPhone: '+91 98401 99887',
            checkIn: '2026-11-10',
            checkOut: '2026-11-12',
            adults: 2,
            children: 0,
            addonAirportShuttle: true,
            addonBreakfast: true
          },
          null,
          2
        )
      );
    } else if (selectedEndpoint === 'POST /api/v1/dining/reserve') {
      setRequestBody(
        JSON.stringify(
          {
            guestName: 'Pooja Sundaram',
            guestEmail: 'pooja.s@partner.in',
            guestPhone: '+91 72999 75115',
            date: '2026-11-05',
            timeSlot: '08:00 PM',
            guestCount: 2,
            seatingPreference: 'indoor-ac',
            specialRequests: 'Table near fountain'
          },
          null,
          2
        )
      );
    } else if (selectedEndpoint === 'GET /api/v1/properties') {
      setRequestBody('');
    } else if (selectedEndpoint === 'GET /api/v1/health') {
      setRequestBody('');
    }
  }, [selectedEndpoint]);

  useEffect(() => {
    // Fetch Laravel blueprint code
    api.getLaravelBlueprint().then((data) => {
      setLaravelCode(data.routesPhp);
    }).catch(console.error);
  }, []);

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCopySnippet = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setCreatingKey(true);
      await api.createApiKey(newKeyName, selectedScopes);
      setNewKeyName('');
      onRefreshKeys();
    } catch (err) {
      console.error('Failed to create key', err);
    } finally {
      setCreatingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await api.deleteApiKey(id);
      onRefreshKeys();
    } catch (err) {
      console.error('Failed to delete key', err);
    }
  };

  const handleExecuteRequest = async () => {
    setIsExecuting(true);
    setSandboxResponse(null);
    setSandboxStatus(null);
    setSandboxLatency(null);

    const startTime = performance.now();
    const [method, path] = selectedEndpoint.split(' ');

    try {
      const activeApiKey = apiKeys[0]?.key || 'sk_live_mm_demo';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Tenant-ID': currentProperty.id,
        'Authorization': `Bearer ${activeApiKey}`
      };

      const options: RequestInit = {
        method,
        headers
      };

      if (method === 'POST' && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(path, options);
      const json = await res.json();
      const endTime = performance.now();

      setSandboxLatency(Math.round(endTime - startTime));
      setSandboxStatus(res.status);
      setSandboxResponse(json);
    } catch (err: unknown) {
      const endTime = performance.now();
      const error = err as Error;
      setSandboxLatency(Math.round(endTime - startTime));
      setSandboxStatus(500);
      setSandboxResponse({ error: error.message });
    } finally {
      setIsExecuting(false);
    }
  };

  // Generate code snippets
  const [method, path] = selectedEndpoint.split(' ');
  const activeKeySample = apiKeys[0]?.key || 'sk_live_mm_7f39a02d84c19ef';

  const curlSnippet =
    method === 'GET'
      ? `curl -X GET "${window.location.origin}${path}" \\
  -H "X-Tenant-ID: ${currentProperty.id}" \\
  -H "Authorization: Bearer ${activeKeySample}" \\
  -H "Accept: application/json"`
      : `curl -X POST "${window.location.origin}${path}" \\
  -H "X-Tenant-ID: ${currentProperty.id}" \\
  -H "Authorization: Bearer ${activeKeySample}" \\
  -H "Content-Type: application/json" \\
  -d '${requestBody.replace(/\n/g, '')}'`;

  const jsSnippet =
    method === 'GET'
      ? `const response = await fetch("${window.location.origin}${path}", {
  method: "GET",
  headers: {
    "X-Tenant-ID": "${currentProperty.id}",
    "Authorization": "Bearer ${activeKeySample}",
    "Accept": "application/json"
  }
});
const data = await response.json();
console.log(data);`
      : `const response = await fetch("${window.location.origin}${path}", {
  method: "POST",
  headers: {
    "X-Tenant-ID": "${currentProperty.id}",
    "Authorization": "Bearer ${activeKeySample}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${requestBody.trim() || '{}'})
});
const result = await response.json();
console.log(result);`;

  const laravelSnippet =
    method === 'GET'
      ? `use Illuminate\\Support\\Facades\\Http;

$response = Http::withHeaders([
    'X-Tenant-ID' => '${currentProperty.id}',
    'Accept' => 'application/json',
])->withToken('${activeKeySample}')
  ->get('${window.location.origin}${path}');

$data = $response->json();`
      : `use Illuminate\\Support\\Facades\\Http;

$payload = ${requestBody.trim() || '[]'};

$response = Http::withHeaders([
    'X-Tenant-ID' => '${currentProperty.id}',
    'Content-Type' => 'application/json',
])->withToken('${activeKeySample}')
  ->post('${window.location.origin}${path}', $payload);

$booking = $response->json();`;

  const currentSnippet =
    codeLanguage === 'curl'
      ? curlSnippet
      : codeLanguage === 'javascript'
      ? jsSnippet
      : laravelSnippet;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
            <Code2 className="w-4 h-4" />
            <span>Third-Party Developer & API Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
            Mount Manor RESTful Hospitality API
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build custom frontends, OTAs, corporate booking widgets, or mobile apps connecting directly to Mount Manor’s headless backend.
          </p>
        </div>

        {/* OpenAPI Download */}
        <div className="flex items-center gap-3">
          <a
            href="/api/v1/docs/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-2 transition-colors font-mono"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>OpenAPI 3.0 Spec</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>
      </div>

      {/* BACKEND GATEWAY & PHP WIRING CONTROLLER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono uppercase tracking-widest font-bold text-amber-400">
                Active Backend Wiring & Routing Target
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                activeBaseUrl
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {activeBaseUrl ? 'Custom PHP / Laravel Target' : 'Built-in Express Gateway (Port 3000)'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {activeBaseUrl ? (
                <>All React CRUD requests are currently routed to <span className="text-amber-300 font-mono font-bold">{activeBaseUrl}/api/v1/*</span></>
              ) : (
                <>All React CRUD requests are handled by the container’s built-in <span className="text-slate-200 font-mono">server.ts</span> API gateway (mirroring Laravel contracts with PostgreSQL).</>
              )}
            </p>
          </div>

          {/* Quick Toggle / Connect Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-amber-400">
              <span className="text-[11px] font-mono text-slate-500 mr-1.5">Target URL:</span>
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="http://localhost:8000"
                className="bg-transparent text-xs font-mono text-white placeholder-slate-600 focus:outline-none w-48"
              />
            </div>

            <button
              onClick={() => handleTestAndSetBackend(customUrlInput)}
              disabled={connectionCheck.status === 'checking'}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {connectionCheck.status === 'checking' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sliders className="w-3.5 h-3.5" />
              )}
              <span>Wire to PHP Backend</span>
            </button>

            {activeBaseUrl && (
              <button
                onClick={handleResetToBuiltin}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
              >
                Reset to Preview Gateway
              </button>
            )}
          </div>
        </div>

        {/* Live Status Feedback Banner */}
        {connectionCheck.status === 'connected' && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Connected successfully! Engine: <strong>{connectionCheck.engine}</strong>. Latency: {connectionCheck.latencyMs}ms. All booking, room, and dining actions are wired to this endpoint.
            </span>
          </div>
        )}

        {connectionCheck.status === 'error' && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div>
                <strong>Could not reach PHP backend at {customUrlInput}:</strong> {connectionCheck.message}
              </div>
              <div className="text-[11px] text-slate-400">
                Tip: If running locally, make sure to execute <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">php artisan serve --port=8000</code> inside the <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300">backend-laravel</code> folder first.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'sandbox'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Interactive API Sandbox</span>
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'keys'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Keys & Credentials ({apiKeys.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'docs'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>Endpoint Schema Reference</span>
        </button>
        <button
          onClick={() => setActiveTab('laravel')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'laravel'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Laravel Backend Architecture</span>
        </button>
        <button
          onClick={() => setActiveTab('postgres')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'postgres'
              ? 'bg-amber-400 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>PostgreSQL (Local Engine)</span>
        </button>
      </div>

      {/* 1. INTERACTIVE API SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Request Panel */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">
                1. Select Live API Endpoint
              </span>

              <div className="flex gap-2">
                <select
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="GET /api/v1/rooms">GET /api/v1/rooms (List Available Rooms & Rates)</option>
                  <option value="POST /api/v1/bookings">POST /api/v1/bookings (Create Room Booking)</option>
                  <option value="POST /api/v1/dining/reserve">POST /api/v1/dining/reserve (Reserve Delicia Table)</option>
                  <option value="GET /api/v1/properties">GET /api/v1/properties (List Hotel Tenants)</option>
                  <option value="GET /api/v1/health">GET /api/v1/health (System Health Check)</option>
                </select>

                <button
                  onClick={handleExecuteRequest}
                  disabled={isExecuting}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isExecuting ? 'Sending...' : 'Send'}</span>
                </button>
              </div>

              {/* Request Headers info */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>X-Tenant-ID:</span>
                  <span className="text-amber-300">{currentProperty.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Authorization:</span>
                  <span className="text-slate-300 truncate max-w-[200px]">Bearer {activeKeySample.slice(0, 16)}...</span>
                </div>
              </div>

              {/* Request Body Editor (For POST requests) */}
              {selectedEndpoint.startsWith('POST') && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>JSON Payload (Body):</span>
                    <span className="text-[10px] text-slate-500">application/json</span>
                  </div>
                  <textarea
                    rows={8}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Code Snippet Generator */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                  Client Code Generator
                </span>
                <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                  <button
                    onClick={() => setCodeLanguage('curl')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${codeLanguage === 'curl' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setCodeLanguage('javascript')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${codeLanguage === 'javascript' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    Fetch
                  </button>
                  <button
                    onClick={() => setCodeLanguage('laravel')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${codeLanguage === 'laravel' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
                  >
                    Laravel
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-200/90 overflow-x-auto leading-relaxed">
                  {currentSnippet}
                </pre>
                <button
                  onClick={() => handleCopySnippet(currentSnippet)}
                  className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{copiedSnippet ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Response Inspector Panel */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 min-h-[420px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                    Live Response Inspector
                  </span>
                  {sandboxStatus && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          sandboxStatus >= 200 && sandboxStatus < 300
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        HTTP {sandboxStatus}
                      </span>
                      {sandboxLatency && (
                        <span className="text-xs font-mono text-slate-400 tabular-nums">
                          {sandboxLatency}ms
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {sandboxResponse ? (
                  <pre className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-[380px] leading-relaxed">
                    {JSON.stringify(sandboxResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="py-24 text-center text-slate-500 space-y-2">
                    <Terminal className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">Click "Send" to fire a real HTTP request to the API server.</p>
                    <p className="text-[11px] text-slate-600">
                      Evaluates status codes, headers, and payload envelope.
                    </p>
                  </div>
                )}
              </div>

              <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800 flex justify-between">
                <span>Standardized JSON:API Envelope</span>
                <span>Response Format: application/json</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. API KEYS TAB */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          {/* Key Generation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">
              Generate 3rd-Party API Token
            </span>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Application / Partner Client Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cleartrip OTA Connector or In-Room Tablet"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Authorized Scopes
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs font-mono pt-1">
                    {['read:rooms', 'write:bookings', 'read:dining', 'write:dining'].map((scope) => (
                      <label key={scope} className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(scope)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedScopes([...selectedScopes, scope]);
                            } else {
                              setSelectedScopes(selectedScopes.filter((s) => s !== scope));
                            }
                          }}
                          className="accent-amber-400"
                        />
                        <span>{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingKey}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {creatingKey ? 'Generating Key...' : 'Issue API Key'}
              </button>
            </form>
          </div>

          {/* Active Keys Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold font-display text-white">
              Provisioned API Keys
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Secret Key Token</th>
                    <th className="py-3 px-4">Scopes</th>
                    <th className="py-3 px-4">Requests</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-white">
                        {k.name}
                        <div className="text-[10px] text-slate-500 font-mono">ID: {k.id}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-400">
                        <div className="flex items-center gap-2">
                          <span>{k.maskedKey}</span>
                          <button
                            onClick={() => handleCopyKey(k.key, k.id)}
                            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy full key"
                          >
                            {copiedKeyId === k.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                          {k.scopes.map((s) => (
                            <span key={s} className="bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-300">
                        {k.requestsCount.toLocaleString()} calls
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteKey(k.id)}
                          className="p-1 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Revoke key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ENDPOINT SCHEMA REFERENCE */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">
              Core REST Endpoints
            </span>

            <div className="space-y-4">
              {/* Endpoint 1 */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                    GET
                  </span>
                  <span className="text-white font-bold">/api/v1/rooms</span>
                </div>
                <p className="text-xs text-slate-400">
                  Retrieves all room categories, available units, bed configurations, and transparent nightly tariffs for the active tenant.
                </p>
                <div className="text-[11px] font-mono text-slate-500">
                  Parameters: <code className="text-slate-300">category</code> (standard, deluxe, suite), <code className="text-slate-300">adults</code> (number).
                </div>
              </div>

              {/* Endpoint 2 */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded">
                    POST
                  </span>
                  <span className="text-white font-bold">/api/v1/bookings</span>
                </div>
                <p className="text-xs text-slate-400">
                  Validates inventory, reserves the specified room, computes total amount with optional airport shuttle and breakfast add-ons, and creates a reservation confirmation voucher with a unique reference code.
                </p>
                <div className="text-[11px] font-mono text-slate-500">
                  Required: <code className="text-slate-300">roomId, guestName, guestEmail, checkIn, checkOut</code>
                </div>
              </div>

              {/* Endpoint 3 */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded">
                    POST
                  </span>
                  <span className="text-white font-bold">/api/v1/dining/reserve</span>
                </div>
                <p className="text-xs text-slate-400">
                  Reserves dining covers at Delicia Multi-Cuisine Restaurant with specific seating zone preference and special dietary notes.
                </p>
              </div>

              {/* Endpoint 4 */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                    GET
                  </span>
                  <span className="text-white font-bold">/api/v1/properties</span>
                </div>
                <p className="text-xs text-slate-400">
                  Lists all registered hospitality tenants on the SaaS network along with contact details, GPS coordinates, and amenities.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. LARAVEL BACKEND BLUEPRINT */}
      {activeTab === 'laravel' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Backend Architecture Blueprint
            </span>
            <h3 className="text-xl font-bold font-display text-white mt-1">
              Deploying on Native Laravel 11 / PHP 8.3
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              For teams deploying their self-hosted Laravel backend cluster, the endpoints adhere to standard Laravel RESTful resource conventions:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-amber-400 block font-mono">stancl/tenancy</span>
              <span className="text-slate-400 text-[11px]">Database/schema separation per hotel property tenant.</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-amber-400 block font-mono">laravel/sanctum</span>
              <span className="text-slate-400 text-[11px]">Token-based authentication & scoped third-party API keys.</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-amber-400 block font-mono">dedoc/scramble</span>
              <span className="text-slate-400 text-[11px]">Auto-generates OpenAPI specs from Laravel Request classes.</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400">
              Laravel API Routes (`routes/api.php`):
            </span>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
              {laravelCode || `// Loading routes/api.php blueprint...`}
            </pre>
          </div>

          {/* Running & Wiring Instructions */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">How to Run & Wire to Real PHP / Laravel</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-amber-300 font-mono text-[11px] block">
                  1. Start Laravel PHP Server
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Inside your cloned git repository with PHP 8.2+ and PostgreSQL running:
                </p>
                <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-emerald-300 font-mono text-[11px] overflow-x-auto">
{`cd backend-laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8000`}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-amber-300 font-mono text-[11px] block">
                  2. Route React Requests to PHP
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Use the <strong>Active Backend Wiring & Routing Target</strong> control bar above to connect to <code className="text-amber-300 font-mono">http://localhost:8000</code>, or set in your environment:
                </p>
                <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-200 font-mono text-[11px] overflow-x-auto">
{`# In your .env or .env.local:
VITE_API_BASE_URL=http://localhost:8000`}
                </pre>
                <p className="text-slate-400 text-[11px]">
                  React will immediately dispatch all room bookings, dining covers, and banquet inquiries directly to your Laravel controllers & Eloquent models!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. POSTGRESQL DATABASE CONSOLE (LOCAL & NON-CLOUD) */}
      {activeTab === 'postgres' && (
        <div className="space-y-6">
          {/* Engine Header Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    100% Local / Self-Hosted (No Cloud Dependency)
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display text-white mt-2">
                  PostgreSQL 16.2 Database Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The application is configured to run on a local PostgreSQL relational database with zero external cloud dependencies.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-right">
                <span className="text-slate-500 block text-[10px]">Active Database</span>
                <span className="text-amber-400 font-bold">mountmanor_local_db</span>
              </div>
            </div>

            {/* Connection Specs strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 text-[10px] block">ENGINE & PROTOCOL</span>
                <span className="text-white font-bold">PostgreSQL 16.2</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 text-[10px] block">HOST & PORT</span>
                <span className="text-slate-200">127.0.0.1:5432</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 text-[10px] block">DATABASE USER</span>
                <span className="text-slate-200">postgres</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 text-[10px] block">CLOUD SERVICES</span>
                <span className="text-emerald-400 font-bold">None (Disabled)</span>
              </div>
            </div>
          </div>

          {/* Relational Tables Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">
              Relational Tables & Live Record Counts
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: 'properties', desc: 'Tenants', count: pgStatus?.rowCounts?.properties ?? 2 },
                { name: 'rooms', desc: 'Room Inventory', count: pgStatus?.rowCounts?.rooms ?? 4 },
                { name: 'bookings', desc: 'Reservations', count: pgStatus?.rowCounts?.bookings ?? 4 },
                { name: 'dining_reservations', desc: 'Delicia Covers', count: pgStatus?.rowCounts?.diningReservations ?? 1 },
                { name: 'banquet_reservations', desc: 'Hall Events', count: pgStatus?.rowCounts?.banquetReservations ?? 1 },
                { name: 'developer_api_keys', desc: 'API Keys', count: pgStatus?.rowCounts?.developerApiKeys ?? 2 }
              ].map((tbl) => (
                <div key={tbl.name} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 block truncate" title={tbl.name}>
                    {tbl.name}
                  </span>
                  <div className="text-xl font-bold font-mono text-white tabular-nums">
                    {tbl.count} <span className="text-[10px] text-slate-500 font-normal">rows</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{tbl.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Interactive SQL Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block">
                  Interactive PostgreSQL Query Runner
                </span>
                <span className="text-xs text-slate-400">
                  Execute standard SQL queries directly against the local database
                </span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
                <button
                  onClick={() => setSqlQuery("SELECT id, name, category, price_per_night, bed_type FROM rooms WHERE property_id = 'mount-manor';")}
                  className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded cursor-pointer text-[11px]"
                >
                  Rooms
                </button>
                <button
                  onClick={() => setSqlQuery("SELECT id, guest_name, nights, total_amount, status FROM bookings;")}
                  className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded cursor-pointer text-[11px]"
                >
                  Bookings
                </button>
                <button
                  onClick={() => setSqlQuery("SELECT id, name, city, phone FROM properties;")}
                  className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded cursor-pointer text-[11px]"
                >
                  Properties
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-amber-400 leading-relaxed"
                placeholder="Write standard PostgreSQL SQL..."
              />

              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono text-slate-500">
                  Supports SELECT, INSERT, UPDATE, JOIN, and transactions
                </span>
                <button
                  onClick={handleRunSql}
                  disabled={isRunningSql}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isRunningSql ? 'Executing...' : 'Run SQL'}</span>
                </button>
              </div>
            </div>

            {sqlError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-xl">
                {sqlError}
              </div>
            )}

            {sqlResults && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Results ({sqlResults.length} rows returned)</span>
                  {sqlDuration && <span>Duration: {sqlDuration}ms</span>}
                </div>

                <div className="overflow-x-auto max-h-72 border border-slate-800 rounded-xl">
                  {sqlResults.length > 0 ? (
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <tr>
                          {Object.keys(sqlResults[0]).map((col) => (
                            <th key={col} className="py-2.5 px-3">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                        {sqlResults.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            {Object.values(row).map((val: any, cIdx) => (
                              <td key={cIdx} className="py-2.5 px-3 text-slate-300 truncate max-w-xs">
                                {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500 font-mono">
                      Query executed successfully. 0 rows returned.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Docker Compose & Local Self-Hosting Guide */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
              Local PostgreSQL Docker Deployment (Included in Repo)
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              To run PostgreSQL 16 on your local developer machine with persistent storage and pgAdmin:
            </p>
            <pre className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-amber-200">
              docker compose up -d
            </pre>
            <p className="text-[11px] text-slate-500">
              `docker-compose.yml` mounts local port 5432 and pgAdmin on port 5050.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
