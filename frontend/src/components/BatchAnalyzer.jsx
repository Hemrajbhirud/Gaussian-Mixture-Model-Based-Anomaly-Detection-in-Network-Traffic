import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, Sparkles, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BatchAnalyzer() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerdict, setFilterVerdict] = useState('ALL');

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      processFile(uploadedFile);
    }
  };

  const processFile = async (uploadedFile) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const res = await fetch('/api/predict/upload-csv', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setBatchResult(data.summary);
      } else {
        alert(data.detail || "Failed to process CSV.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error processing CSV file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const loadDemoBatch = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/flows?limit=60');
      const data = await res.json();
      if (data.flows) {
        const batchRes = await fetch('/api/predict/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.flows.map(f => ({
            "Destination Port": f.destination_port,
            "Flow Duration": f.flow_duration,
            "Total Fwd Packets": f.total_fwd_packets,
            "Total Backward Packets": f.total_bwd_packets,
            "Total Length of Fwd Packets": f.total_len_fwd_pkts,
            "Total Length of Bwd Packets": f.total_len_bwd_pkts,
            "Flow Bytes/s": f.flow_bytes_per_sec,
            "Flow Packets/s": f.flow_pkts_per_sec,
            "Packet Length Mean": f.packet_length_mean,
            "Average Packet Size": f.avg_packet_size
          })))
        });
        const batchData = await batchRes.json();
        if (batchData.success) {
          setBatchResult(batchData.summary);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCSVReport = () => {
    if (!batchResult || !batchResult.sample_results) return;
    const headers = ["Index,Destination Port,Flow Duration,Total Fwd,Total Bwd,GMM Score,KMeans Distance,Verdict\n"];
    const rows = batchResult.sample_results.map(r => 
      `${r.index},${r.destination_port},${r.flow_duration},${r.total_fwd_packets},${r.total_bwd_packets},${r.gmm_score},${r.kmeans_distance},${r.verdict}\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AegisGMM_Triage_Report_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = batchResult?.top_ports 
    ? Object.entries(batchResult.top_ports).map(([port, count]) => ({ port: `Port ${port}`, count }))
    : [];

  const filteredSamples = batchResult?.sample_results?.filter(item => {
    if (filterVerdict !== 'ALL' && item.verdict !== filterVerdict) return false;
    if (searchTerm && !item.destination_port.toString().includes(searchTerm)) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      
      {/* Upload & Demo Action Bar */}
      <div className="rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
              <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
              <span>Batch PCAP Flow Log Triage</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl font-sans">
              Stream or upload bulk multi-flow CSV captures for high-throughput anomaly screening, targeted port distribution, and triage exports.
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={loadDemoBatch}
              disabled={isProcessing}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-amber-300 border border-amber-500/30 text-xs font-mono font-medium flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isProcessing ? "Processing Triage..." : "Load Demo 60-Flow Incident Log"}</span>
            </button>
          </div>
        </div>

        {/* Upload Drop Zone */}
        <div className="mt-6 border-2 border-dashed border-white/[0.1] hover:border-amber-500/50 rounded-2xl p-8 text-center transition-all bg-[#09090c]/60 group">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            id="csv-upload"
            className="hidden"
          />
          <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] mb-3 group-hover:scale-105 group-hover:border-amber-500/40 transition-all">
              <UploadCloud className="w-8 h-8 text-zinc-400 group-hover:text-amber-400 transition-colors" />
            </div>
            <span className="text-xs font-medium text-zinc-200">
              {file ? file.name : "Click or drag & drop CSV flow capture here"}
            </span>
            <span className="text-[11px] text-zinc-500 mt-1 font-mono">
              Parses 10-feature telemetry schema (Destination Port, Flow Duration, Packets/s...)
            </span>
          </label>
        </div>
      </div>

      {/* Batch Results View */}
      {batchResult && (
        <div className="space-y-6">
          
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-4 font-mono shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Total Flows Triaged</span>
              <span className="text-2xl font-bold text-white">{batchResult.total_flows}</span>
              <span className="text-[11px] text-zinc-500 block mt-1">Telemetry Pipeline</span>
            </div>

            <div className="rounded-2xl bg-rose-950/20 border border-rose-500/40 p-4 font-mono shadow-[0_0_20px_rgba(244,63,94,0.1)]">
              <span className="text-[10px] text-rose-400 uppercase tracking-wider block mb-1">Anomalies Detected</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-rose-400">{batchResult.anomaly_count}</span>
                <span className="text-xs text-rose-300 font-semibold">({batchResult.anomaly_rate_pct}%)</span>
              </div>
              <span className="text-[11px] text-rose-400/70 block mt-1">Flagged for Triage</span>
            </div>

            <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/40 p-4 font-mono shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">Normal Flows</span>
              <span className="text-2xl font-bold text-emerald-400">{batchResult.normal_count}</span>
              <span className="text-[11px] text-emerald-400/70 block mt-1">Verified within Density</span>
            </div>

            <div className="rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-4 font-mono shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Decision Threshold τ</span>
              <span className="text-2xl font-bold text-amber-400">{batchResult.gmm_threshold}</span>
              <span className="text-[11px] text-zinc-500 block mt-1">1st Percentile Density Cutoff</span>
            </div>
          </div>

          {/* Targeted Ports Chart & Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Top Ports Bar Chart */}
            <div className="lg:col-span-5 rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-xs font-semibold text-zinc-200 mb-4 font-mono uppercase tracking-wider">
                Destination Port Incident Frequency
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="port" stroke="#71717a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090c', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Flows Table */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-6 shadow-xl backdrop-blur-xl flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-zinc-200 font-mono uppercase tracking-wider">Flow Triage Table</span>
                  <span className="text-[11px] text-zinc-500 font-mono">({filteredSamples.length} rows)</span>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={filterVerdict}
                    onChange={(e) => setFilterVerdict(e.target.value)}
                    className="bg-[#141419] border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs font-mono text-zinc-300 focus:outline-none"
                  >
                    <option value="ALL">All Verdicts</option>
                    <option value="ATTACK">Attacks Only</option>
                    <option value="NORMAL">Normal Only</option>
                  </select>

                  <button
                    onClick={downloadCSVReport}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] transition-all"
                    title="Export CSV Triage Report"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>

              {/* Scrollable Table */}
              <div className="overflow-x-auto overflow-y-auto max-h-72 border border-white/[0.06] rounded-xl">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#09090c] sticky top-0 border-b border-white/[0.06] text-zinc-400">
                    <tr>
                      <th className="p-2.5">Flow #</th>
                      <th className="p-2.5">Port</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5">Packets</th>
                      <th className="p-2.5">GMM Score</th>
                      <th className="p-2.5">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                    {filteredSamples.map((row) => (
                      <tr key={row.index} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-2.5 text-zinc-500">#{row.index}</td>
                        <td className="p-2.5 font-semibold text-amber-300">{row.destination_port}</td>
                        <td className="p-2.5">{Math.round(row.flow_duration).toLocaleString()} µs</td>
                        <td className="p-2.5">{row.total_fwd_packets + row.total_bwd_packets}</td>
                        <td className="p-2.5 font-mono">{row.gmm_score}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            row.verdict === 'ATTACK'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {row.verdict}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
