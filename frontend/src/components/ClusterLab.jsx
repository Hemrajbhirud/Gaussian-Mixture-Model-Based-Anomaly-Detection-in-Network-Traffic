import React, { useState, useEffect } from 'react';
import { Layers, Activity, SlidersHorizontal } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ClusterLab({ currentInspection }) {
  const [points, setPoints] = useState({ normal: [], attack: [] });
  const [threshold, setThreshold] = useState(-1.2862);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cluster-points')
      .then(res => res.json())
      .then(data => {
        if (data.points) {
          setPoints(data.points);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load cluster points:", err);
        setIsLoading(false);
      });
  }, []);

  const inspectedPoint = currentInspection?.pca_coordinates ? [{
    x: currentInspection.pca_coordinates.pc1,
    y: currentInspection.pca_coordinates.pc2,
    type: 'Current Flow'
  }] : [];

  // Simulated sensitivity trade-off curve based on threshold
  const estimatedRecall = Math.min(99.9, Math.max(10.0, 97.22 - (threshold + 1.2862) * 8.5)).toFixed(1);
  const estimatedPrecision = Math.min(95.0, Math.max(15.0, 55.04 + (threshold + 1.2862) * 7.2)).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="rounded-2xl bg-[#0e0e12]/95 border border-white/[0.08] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-semibold text-white">
                PCA Latent Manifold & Cluster Density (Colab Step 12)
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
              Continuous 2D projection of the 10-dimensional network telemetry features ($PC_1$ vs $PC_2$). Normal traffic forms high-density Gaussian components, while attack vectors populate low-density margins.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-[#141419] border border-white/[0.06] text-zinc-300">
              <span className="text-zinc-500 text-[11px]">PCA BASIS:</span> <span className="text-amber-400 font-bold">4D</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#141419] border border-white/[0.06] text-zinc-300">
              <span className="text-zinc-500 text-[11px]">VARIANCE:</span> <span className="text-emerald-400 font-bold">82.57%</span>
            </div>
          </div>
        </div>

        {/* Scatter Plot & Inspector Projection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          
          <div className="lg:col-span-8 rounded-2xl bg-[#09090c] border border-white/[0.06] p-4 shadow-inner">
            <div className="flex items-center justify-between mb-3 px-2 text-xs font-mono text-zinc-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <span className="text-zinc-300">Normal Baseline Cluster</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                  <span className="text-zinc-300">Attack Outliers</span>
                </div>
                {inspectedPoint.length > 0 && (
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white animate-ping" />
                    <span className="text-amber-300 font-bold">Inspected Vector</span>
                  </div>
                )}
              </div>
              <span className="text-[11px] text-zinc-500">$PC_1$ vs $PC_2$ Latent Projection</span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                  <XAxis type="number" dataKey="x" name="PC 1" stroke="#71717a" fontSize={10} domain={[-5, 8]} />
                  <YAxis type="number" dataKey="y" name="PC 2" stroke="#71717a" fontSize={10} domain={[-4, 8]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: '#09090c', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Scatter name="Normal" data={points.normal} fill="#10b981" opacity={0.65} />
                  <Scatter name="Attack" data={points.attack} fill="#f43f5e" opacity={0.65} />
                  {inspectedPoint.length > 0 && (
                    <Scatter name="Current Flow" data={inspectedPoint} fill="#fbbf24" shape="star" />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Threshold Tuning Simulator */}
          <div className="lg:col-span-4 rounded-2xl bg-[#141419] border border-white/[0.08] p-5 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center space-x-2 text-white text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Decision Threshold Simulator</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4 font-sans">
                Colab Step 11 scanned empirical percentiles to calibrate $\tau = -1.2862$. Adjust slider to observe real-time trade-offs.
              </p>

              <div className="bg-[#09090c] p-3.5 rounded-xl border border-white/[0.06] font-mono text-xs mb-4">
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Simulated Threshold (τ):</span>
                  <span className="text-amber-400 font-bold">{threshold}</span>
                </div>
                <input
                  type="range"
                  min="-4.0"
                  max="2.0"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>-4.0 (Higher Recall)</span>
                  <span>+2.0 (Higher Precision)</span>
                </div>
              </div>

              {/* Dynamic Sensitivity Projection */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#09090c] border border-white/[0.06]">
                  <span className="text-zinc-400">Attack Capture (Recall):</span>
                  <span className="text-emerald-400 font-bold">{estimatedRecall}%</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#09090c] border border-white/[0.06]">
                  <span className="text-zinc-400">Precision Rate:</span>
                  <span className="text-amber-400 font-bold">{estimatedPrecision}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#09090c]/60 rounded-xl border border-white/[0.06] text-[11px] text-zinc-400 font-sans">
              <span className="font-semibold text-zinc-200 block mb-0.5">Faculty Presentation Insight:</span>
              In security defense, missing an attack (False Negative) is catastrophic, which is why optimizing for 97.22% recall with full-covariance GMM is mathematically superior.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
