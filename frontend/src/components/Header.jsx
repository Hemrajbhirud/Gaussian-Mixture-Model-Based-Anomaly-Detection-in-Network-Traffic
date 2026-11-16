import React from 'react';
import { ShieldCheck, Activity, Sliders, BarChart3, FileSpreadsheet, Layers, Sparkles } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, backendStatus }) {
  const tabs = [
    { id: 'inspector', label: 'Flow Inspector', icon: Activity, tag: 'Real-Time' },
    { id: 'explorer', label: 'Dataset Explorer', icon: Sliders, tag: '500 Flows' },
    { id: 'batch', label: 'Batch Triage', icon: FileSpreadsheet, tag: 'CSV Analysis' },
    { id: 'pca', label: 'PCA Latent Space', icon: Layers, tag: '4D Manifold' },
    { id: 'metrics', label: 'Academic Benchmark', icon: BarChart3, tag: 'GMM vs K-Means' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#070709]/90 backdrop-blur-xl border-b border-white/[0.07] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Architecture */}
          <div className="flex items-center space-x-4">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/25 to-yellow-600/15 rounded-xl blur-md group-hover:blur-lg transition duration-500 opacity-60"></div>
              <div className="relative w-11 h-11 rounded-xl bg-[#111115] border border-white/[0.12] flex items-center justify-center text-amber-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
                <ShieldCheck className="w-6 h-6 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-lg font-bold tracking-tight text-white flex items-center">
                  AEGIS<span className="text-amber-400">.GMM</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse" />
                  PREMIER EDITION
                </span>
              </div>
              <p className="text-[12px] text-zinc-400 font-sans tracking-tight">
                Gaussian Mixture Telemetry & Zero-Day Threat Architecture
              </p>
            </div>
          </div>

          {/* Precision Telemetry Badges */}
          <div className="hidden lg:flex items-center space-x-2.5 font-mono text-xs">
            
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#111115] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] text-zinc-300">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${backendStatus ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${backendStatus ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
              <span className="text-zinc-500 text-[11px]">TELEMETRY ENGINE:</span>
              <span className={`font-semibold ${backendStatus ? 'text-emerald-400' : 'text-rose-400'}`}>
                {backendStatus ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#111115] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] text-zinc-300">
              <span className="text-zinc-500 text-[11px]">ATTACK RECALL:</span>
              <span className="text-emerald-400 font-semibold tracking-tight">97.22%</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#111115] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] text-zinc-300">
              <span className="text-zinc-500 text-[11px]">THRESHOLD τ:</span>
              <span className="text-amber-400 font-semibold tracking-tight">-1.2862</span>
            </div>

          </div>
        </div>

        {/* High-End Segmented Navigation Control */}
        <div className="flex space-x-2 border-t border-white/[0.06] py-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-white/[0.09] text-white border border-white/[0.14] shadow-[0_2px_14px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.15)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive 
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                    : 'bg-white/[0.04] text-zinc-500'
                }`}>
                  {tab.tag}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
