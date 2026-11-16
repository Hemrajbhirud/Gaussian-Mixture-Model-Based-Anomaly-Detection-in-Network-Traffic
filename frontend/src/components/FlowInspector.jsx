import React, { useState } from 'react';
import { PRESET_FLOWS } from '../data/presets';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, Activity, 
  Cpu, Sparkles, RefreshCw, Zap, Terminal, Server, Network
} from 'lucide-react';

export default function FlowInspector({ onPredict, prediction, isPredicting }) {
  const [formData, setFormData] = useState({ ...PRESET_FLOWS[0].values });
  const [selectedPreset, setSelectedPreset] = useState(PRESET_FLOWS[0].name);

  const trafficFeatures = [
    { key: "Destination Port", label: "Destination Port", unit: "Port #", min: 1, max: 65535, step: 1, desc: "Target server network port (e.g. 22 SSH, 80 HTTP, 443 HTTPS)" },
    { key: "Flow Duration", label: "Flow Duration", unit: "µs", min: 10, max: 120000000, step: 1000, desc: "Microseconds elapsed between first and last packet in session" },
    { key: "Flow Bytes/s", label: "Byte Throughput", unit: "B/s", min: 0, max: 5000000, step: 100, desc: "Aggregate byte transmission rate across session duration" },
    { key: "Flow Packets/s", label: "Packet Frequency", unit: "Pkts/s", min: 0, max: 500000, step: 10, desc: "Packet transmission density per second" }
  ];

  const packetFeatures = [
    { key: "Total Fwd Packets", label: "Fwd Packet Count", unit: "pkts", min: 1, max: 500, step: 1, desc: "Number of outbound packets sent from source to destination" },
    { key: "Total Backward Packets", label: "Bwd Packet Count", unit: "pkts", min: 0, max: 500, step: 1, desc: "Number of response packets received from destination" },
    { key: "Total Length of Fwd Packets", label: "Fwd Total Payload", unit: "bytes", min: 0, max: 50000, step: 10, desc: "Cumulative payload size in forward direction" },
    { key: "Total Length of Bwd Packets", label: "Bwd Total Payload", unit: "bytes", min: 0, max: 100000, step: 50, desc: "Cumulative payload size in reverse direction" },
    { key: "Packet Length Mean", label: "Packet Length Mean", unit: "bytes", min: 0, max: 2000, step: 1, desc: "Average byte length of individual session packets" },
    { key: "Average Packet Size", label: "Avg Packet Size", unit: "bytes", min: 0, max: 2500, step: 1, desc: "Normalized mean packet size including protocol headers" }
  ];

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
    setSelectedPreset(null);
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.name);
    setFormData({ ...preset.values });
    onPredict(preset.values);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict(formData);
  };

  return (
    <div className="space-y-6">
      
      {/* High-End Preset Carousel / Scenario Selector */}
      <div className="relative rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-semibold">
              Benchmark Telemetry Profiles
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            Empirical CICIDS2017 Dataset
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PRESET_FLOWS.map((preset) => {
            const isSelected = selectedPreset === preset.name;
            const isAttack = preset.category !== "BENIGN";
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`group relative text-left p-3 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? isAttack 
                      ? 'bg-rose-950/30 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2),inset_0_1px_0_0_rgba(244,63,94,0.3)]'
                      : 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2),inset_0_1px_0_0_rgba(16,185,129,0.3)]'
                    : 'bg-[#131317]/70 border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                    isAttack ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'
                  }`}>
                    {preset.category}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    isSelected ? (isAttack ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400 animate-pulse') : (isAttack ? 'bg-rose-500/40' : 'bg-emerald-500/40')
                  }`} />
                </div>
                <div className={`font-medium text-xs truncate mt-1 ${isSelected ? 'text-white font-semibold' : 'text-zinc-300 group-hover:text-white'}`}>
                  {preset.name}
                </div>
                <div className="font-mono text-[11px] text-zinc-500 mt-0.5">
                  Port: {preset.values["Destination Port"]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 10-Feature Telemetry Form */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
          
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>10-Dimensional Network Telemetry Vector</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                StandardScaler → 4D PCA Decomposition → GMM Negative Log-Likelihood
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => handlePresetSelect(PRESET_FLOWS[0])}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center space-x-1 font-mono px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Section 1: Network Transport & Rates */}
            <div>
              <div className="flex items-center space-x-2 mb-3 text-xs font-mono uppercase text-zinc-400 font-medium">
                <Network className="w-3.5 h-3.5 text-amber-400" />
                <span>Transport & Session Dynamics</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trafficFeatures.map((f) => (
                  <div key={f.key} className="bg-[#141419] border border-white/[0.06] rounded-xl p-3 hover:border-white/[0.12] transition-all">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-zinc-300 truncate" title={f.desc}>
                        {f.label}
                      </span>
                      <span className="font-mono text-[10px] text-amber-300/90 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                        {f.unit}
                      </span>
                    </div>
                    
                    <input
                      type="number"
                      step={f.step}
                      value={formData[f.key] ?? 0}
                      onChange={(e) => handleInputChange(f.key, e.target.value)}
                      className="w-full bg-[#0a0a0d] border border-white/[0.08] focus:border-amber-500 rounded-lg px-2.5 py-1.5 font-mono text-xs text-zinc-100 focus:outline-none transition-colors"
                    />
                    
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={formData[f.key] ?? 0}
                      onChange={(e) => handleInputChange(f.key, e.target.value)}
                      className="w-full mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Packet Geometry & Volume */}
            <div>
              <div className="flex items-center space-x-2 mb-3 text-xs font-mono uppercase text-zinc-400 font-medium">
                <Server className="w-3.5 h-3.5 text-zinc-300" />
                <span>Payload Volume & Statistical Geometry</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {packetFeatures.map((f) => (
                  <div key={f.key} className="bg-[#141419] border border-white/[0.06] rounded-xl p-3 hover:border-white/[0.12] transition-all">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-zinc-300 truncate" title={f.desc}>
                        {f.label}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-300 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.1]">
                        {f.unit}
                      </span>
                    </div>
                    
                    <input
                      type="number"
                      step={f.step}
                      value={formData[f.key] ?? 0}
                      onChange={(e) => handleInputChange(f.key, e.target.value)}
                      className="w-full bg-[#0a0a0d] border border-white/[0.08] focus:border-amber-500 rounded-lg px-2.5 py-1.5 font-mono text-xs text-zinc-100 focus:outline-none transition-colors"
                    />
                    
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={formData[f.key] ?? 0}
                      onChange={(e) => handleInputChange(f.key, e.target.value)}
                      className="w-full mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Inference Button */}
            <button
              type="submit"
              disabled={isPredicting}
              className="relative w-full py-3.5 px-6 rounded-xl font-mono text-xs font-bold tracking-wider uppercase text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] border border-amber-300 transition-all flex items-center justify-center space-x-2.5 disabled:opacity-50"
            >
              {isPredicting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Computing Density Likelihood...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>Execute Real-Time GMM Inference</span>
                  <ArrowRight className="w-4 h-4 text-zinc-950" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: High-End Prediction HUD */}
        <div className="lg:col-span-5 space-y-6">
          {prediction ? (
            <div className={`rounded-2xl border p-6 shadow-[0_12px_40px_rgb(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 ${
              prediction.is_anomaly
                ? 'bg-gradient-to-b from-rose-950/30 to-[#0e0e12] border-rose-500/40 shadow-rose-glow'
                : 'bg-gradient-to-b from-emerald-950/30 to-[#0e0e12] border-emerald-500/40 shadow-emerald-glow'
            }`}>
              
              {/* Verdict Header */}
              <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg ${
                    prediction.is_anomaly
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                      : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  }`}>
                    {prediction.is_anomaly ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                      GMM Likelihood Decision
                    </span>
                    <h3 className={`text-xl font-mono font-bold tracking-tight ${
                      prediction.is_anomaly ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {prediction.verdict}
                    </h3>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border tracking-wide ${
                  prediction.threat_level === 'CRITICAL' ? 'bg-rose-600/30 text-rose-300 border-rose-500' :
                  prediction.threat_level === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                  prediction.threat_level === 'ELEVATED' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  THREAT: {prediction.threat_level}
                </span>
              </div>

              {/* Diagnosis Banner */}
              <div className="my-4 p-3.5 rounded-xl bg-[#09090c]/80 border border-white/[0.08]">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Attack Signature Diagnosis
                </div>
                <div className="text-sm font-semibold text-zinc-100 mt-0.5">
                  {prediction.attack_profile}
                </div>
                <div className="text-xs text-zinc-400 mt-1 font-mono flex items-center justify-between">
                  <span>Confidence Rating:</span>
                  <span className="text-amber-400 font-bold font-mono">{prediction.confidence_pct}%</span>
                </div>
              </div>

              {/* Comparison Gauge (GMM vs K-Means) */}
              <div className="space-y-3 pt-1">
                
                {/* GMM Primary Metric */}
                <div className="bg-[#141419] border border-white/[0.08] rounded-xl p-3.5">
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <span className="text-zinc-300 font-medium flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Primary: GMM Log-Likelihood</span>
                    </span>
                    <span className={`font-bold ${prediction.is_anomaly ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {prediction.gmm.score}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono mb-2">
                    <span>Decision Threshold τ: <strong className="text-zinc-200">{prediction.gmm.threshold}</strong></span>
                    <span>Margin: <strong className={prediction.gmm.margin >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      {prediction.gmm.margin > 0 ? `+${prediction.gmm.margin}` : prediction.gmm.margin}
                    </strong></span>
                  </div>

                  {/* Gradient Density Scale */}
                  <div className="relative w-full h-2.5 bg-[#09090c] rounded-full overflow-hidden border border-white/[0.06]">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        prediction.is_anomaly 
                          ? 'bg-gradient-to-r from-rose-600 to-rose-400' 
                          : 'bg-gradient-to-r from-emerald-600 to-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, (prediction.gmm.score + 5) * 12))}%` }}
                    />
                  </div>
                </div>

                {/* K-Means Baseline Metric */}
                <div className="bg-[#141419] border border-white/[0.08] rounded-xl p-3.5">
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <span className="text-zinc-300 font-medium flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                      <span>Baseline: K-Means Centroid Distance</span>
                    </span>
                    <span className={`font-bold ${prediction.kmeans.prediction === 'ATTACK' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {prediction.kmeans.distance}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono mb-2">
                    <span>Distance Threshold: <strong className="text-zinc-200">{prediction.kmeans.threshold}</strong></span>
                    <span>Baseline Verdict: <strong className="text-zinc-200">{prediction.kmeans.prediction}</strong></span>
                  </div>

                  <div className="relative w-full h-2.5 bg-[#09090c] rounded-full overflow-hidden border border-white/[0.06]">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        prediction.kmeans.prediction === 'ATTACK' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, prediction.kmeans.distance * 35))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4D PCA Vector Projection */}
              <div className="mt-4 pt-4 border-t border-white/[0.08]">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  4-Dimensional PCA Latent Projections:
                </div>
                <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                  {Object.entries(prediction.pca_coordinates).map(([key, val]) => (
                    <div key={key} className="bg-[#09090c] p-2 rounded-lg border border-white/[0.06] text-center shadow-inner">
                      <span className="text-zinc-500 text-[10px] uppercase block">{key}</span>
                      <span className="text-amber-300 font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-8 flex flex-col items-center justify-center text-center text-zinc-400 shadow-xl backdrop-blur-xl">
              <Cpu className="w-12 h-12 text-zinc-600 mb-4 animate-pulse" />
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">Telemetry Ready</h3>
              <p className="text-xs max-w-xs text-zinc-500 mb-6 font-sans">
                Select a benchmark profile above or modify network flow features to evaluate probability density.
              </p>
              <button
                onClick={() => onPredict(formData)}
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono rounded-lg border border-amber-500/30 transition-all"
              >
                Inference Selected Preset →
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
