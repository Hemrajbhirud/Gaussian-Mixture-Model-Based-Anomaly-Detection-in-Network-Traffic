import React, { useState, useEffect } from 'react';
import { Sliders, ChevronLeft, ChevronRight, CheckCircle2, XCircle, ArrowUpRight, Filter } from 'lucide-react';

export default function FlowExplorer({ onSendToInspector }) {
  const [flows, setFlows] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/flows?limit=500')
      .then(res => res.json())
      .then(data => {
        if (data.flows) {
          setFlows(data.flows);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch sample flows:", err);
        setIsLoading(false);
      });
  }, []);

  const filteredFlows = flows.filter(flow => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'BENIGN') return flow.actual_label === 'BENIGN';
    if (filterCategory === 'ATTACK') return flow.actual_label !== 'BENIGN';
    return flow.actual_label.toLowerCase().includes(filterCategory.toLowerCase());
  });

  const currentFlow = filteredFlows[currentIndex] || flows[0];

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setCurrentIndex(val);
  };

  const handleFilterChange = (cat) => {
    setFilterCategory(cat);
    setCurrentIndex(0);
  };

  const categories = ['ALL', 'BENIGN', 'DDoS', 'DoS Hulk', 'PortScan', 'SSH-Patator'];

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-16 text-center text-zinc-400 backdrop-blur-xl shadow-xl">
        <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="font-mono text-xs tracking-wider uppercase text-zinc-300">Loading 500 Stratified Test Flows (Colab Step 13)...</p>
      </div>
    );
  }

  if (!currentFlow) {
    return null;
  }

  const isMatch = (currentFlow.actual_attack === 1 && currentFlow.gmm_prediction === 'ATTACK') ||
                  (currentFlow.actual_attack === 0 && currentFlow.gmm_prediction === 'NORMAL');

  return (
    <div className="space-y-6">
      
      {/* Colab Step 13 Interactive Slider Card */}
      <div className="rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sliders className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-semibold text-white">
                Interactive Test Flow Explorer (Colab Step 13)
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
              Direct telemetry inspection of 500 test set flows from the 18,207 held-out validation split. Slide to examine how the GMM density compares to the true attack labels.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-zinc-500 mr-1 flex items-center">
              <Filter className="w-3 h-3 mr-1 text-zinc-400" /> Filter:
            </span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleFilterChange(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-200 ${
                  filterCategory === cat
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-[#141419] text-zinc-400 border border-white/[0.06] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Range Slider */}
        <div className="pt-6 pb-2">
          <div className="flex items-center justify-between mb-3 font-mono text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-zinc-400 text-[11px]">ACTIVE FLOW:</span>
              <span className="text-amber-400 font-bold text-xs bg-[#09090c] px-2.5 py-0.5 rounded-md border border-amber-500/30">
                #{currentFlow.flow_id}
              </span>
              <span className="text-zinc-500 text-[11px]">
                ({currentIndex + 1} of {filteredFlows.length} matching)
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="p-1.5 rounded-lg bg-[#141419] hover:bg-white/[0.06] border border-white/[0.08] disabled:opacity-30 text-zinc-300 transition-all"
                title="Previous Flow"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentIndex(prev => Math.min(filteredFlows.length - 1, prev + 1))}
                disabled={currentIndex === filteredFlows.length - 1}
                className="p-1.5 rounded-lg bg-[#141419] hover:bg-white/[0.06] border border-white/[0.08] disabled:opacity-30 text-zinc-300 transition-all"
                title="Next Flow"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(0, filteredFlows.length - 1)}
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full"
          />
        </div>
      </div>

      {/* Flow Details & Verdict Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Comparison HUD */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Ground Truth vs Model Output</span>
            <span className={`flex items-center space-x-1.5 text-xs font-mono px-2.5 py-0.5 rounded-full border ${
              isMatch 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}>
              {isMatch ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              <span>{isMatch ? 'CORRECT CLASSIFICATION' : 'MISCLASSIFICATION'}</span>
            </span>
          </div>

          {/* Actual vs GMM Output Bento */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-[#141419] p-3.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Ground Truth Label</span>
              <span className={`text-sm font-bold truncate block ${
                currentFlow.actual_attack === 1 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {currentFlow.actual_label}
              </span>
              <span className="block text-[10px] text-zinc-500 mt-1">
                {currentFlow.actual_attack === 1 ? 'Labeled Intrusion' : 'Normal Baseline'}
              </span>
            </div>

            <div className="bg-[#141419] p-3.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">GMM Prediction</span>
              <span className={`text-sm font-bold block ${
                currentFlow.gmm_prediction === 'ATTACK' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {currentFlow.gmm_prediction}
              </span>
              <span className="block text-[10px] text-zinc-500 mt-1 font-mono">
                Score: {currentFlow.gmm_score}
              </span>
            </div>
          </div>

          {/* Precision Comparison Metrics */}
          <div className="space-y-2.5 pt-1">
            <div className="bg-[#141419] p-3 rounded-xl border border-white/[0.06] font-mono text-xs">
              <div className="flex justify-between text-zinc-300 mb-1">
                <span className="text-zinc-400">GMM Log-Likelihood:</span>
                <span className="text-amber-400 font-semibold">{currentFlow.gmm_score}</span>
              </div>
              <div className="flex justify-between text-zinc-500 text-[11px]">
                <span>Decision Threshold τ:</span>
                <span className="text-zinc-400">-1.2862</span>
              </div>
            </div>

            <div className="bg-[#141419] p-3 rounded-xl border border-white/[0.06] font-mono text-xs">
              <div className="flex justify-between text-zinc-300 mb-1">
                <span className="text-zinc-400">K-Means Nearest Centroid:</span>
                <span className="text-zinc-300 font-semibold">{currentFlow.kmeans_score}</span>
              </div>
              <div className="flex justify-between text-zinc-500 text-[11px]">
                <span>Distance Threshold τ:</span>
                <span className="text-zinc-400">0.5476</span>
              </div>
            </div>
          </div>

          {/* Send to Inspector Action */}
          <button
            onClick={() => onSendToInspector({
              "Destination Port": currentFlow.destination_port,
              "Flow Duration": currentFlow.flow_duration,
              "Total Fwd Packets": currentFlow.total_fwd_packets,
              "Total Backward Packets": currentFlow.total_bwd_packets,
              "Total Length of Fwd Packets": currentFlow.total_len_fwd_pkts,
              "Total Length of Bwd Packets": currentFlow.total_len_bwd_pkts,
              "Flow Bytes/s": currentFlow.flow_bytes_per_sec,
              "Flow Packets/s": currentFlow.flow_pkts_per_sec,
              "Packet Length Mean": currentFlow.packet_length_mean,
              "Average Packet Size": currentFlow.avg_packet_size
            })}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.1] text-xs font-mono font-medium flex items-center justify-center space-x-2 transition-all shadow-sm group"
          >
            <span>Transfer Flow #{currentFlow.flow_id} into Live Inspector</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* 10-D Feature Telemetry Matrix */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
            <h3 className="text-xs font-semibold text-zinc-200 font-mono uppercase tracking-wider">
              10-D Raw Flow Telemetry Parameters
            </h3>
            <span className="text-[11px] font-mono text-zinc-500">Held-Out Test Sample</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
            <div className="bg-[#141419] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">Destination Port</span>
              <span className="text-zinc-100 font-semibold">{currentFlow.destination_port}</span>
            </div>
            <div className="bg-[#141419] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">Flow Duration (µs)</span>
              <span className="text-zinc-100 font-semibold">{currentFlow.flow_duration.toLocaleString()}</span>
            </div>
            <div className="bg-[#141419] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">Total Fwd Packets</span>
              <span className="text-zinc-100 font-semibold">{currentFlow.total_fwd_packets}</span>
            </div>
            <div className="bg-[#141419] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">Total Bwd Packets</span>
              <span className="text-zinc-100 font-semibold">{currentFlow.total_bwd_packets}</span>
            </div>
            <div className="bg-[#141419] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">Total Length Fwd Pkts</span>
              <span className="text-zinc-100 font-semibold">{currentFlow.total_len_fwd_pkts.toLocaleString()} B</span>
            </div>
            <div className="bg-[#141419] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">Total Length Bwd Pkts</span>
              <span className="text-zinc-100 font-semibold">{currentFlow.total_len_bwd_pkts.toLocaleString()} B</span>
            </div>
            <div className="bg-[#141419] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">Flow Throughput</span>
              <span className="text-zinc-100 font-semibold">{currentFlow.flow_bytes_per_sec.toFixed(2)} B/s</span>
            </div>
            <div className="bg-[#141419] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">Flow Packet Rate</span>
              <span className="text-zinc-100 font-semibold">{currentFlow.flow_pkts_per_sec.toFixed(2)} P/s</span>
            </div>
            <div className="bg-[#141419] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">Packet Length Mean</span>
              <span className="text-zinc-100 font-semibold">{currentFlow.packet_length_mean.toFixed(2)} B</span>
            </div>
            <div className="bg-[#141419] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">Average Packet Size</span>
              <span className="text-zinc-100 font-semibold">{currentFlow.avg_packet_size.toFixed(2)} B</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
