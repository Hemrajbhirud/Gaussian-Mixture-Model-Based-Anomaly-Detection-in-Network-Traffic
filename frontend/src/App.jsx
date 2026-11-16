import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FlowInspector from './components/FlowInspector';
import FlowExplorer from './components/FlowExplorer';
import BatchAnalyzer from './components/BatchAnalyzer';
import ClusterLab from './components/ClusterLab';
import ModelMethodology from './components/ModelMethodology';
import { PRESET_FLOWS } from './data/presets';

export default function App() {
  const [activeTab, setActiveTab] = useState('inspector');
  const [backendStatus, setBackendStatus] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') {
          setBackendStatus(true);
        }
      })
      .catch(() => setBackendStatus(false));
  }, []);

  // Run initial prediction with preset on mount
  useEffect(() => {
    handlePredict(PRESET_FLOWS[0].values);
  }, []);

  const handlePredict = async (flowValues) => {
    setIsPredicting(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flowValues)
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPrediction(data.result);
        setBackendStatus(true);
      }
    } catch (err) {
      console.error("Inference request failed:", err);
      setBackendStatus(false);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSendToInspector = (flowValues) => {
    setActiveTab('inspector');
    handlePredict(flowValues);
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col font-sans text-zinc-100 grid-pattern selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Ambient Warm Golden Ray Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-64 bg-gradient-to-b from-amber-500/[0.04] via-amber-500/[0.01] to-transparent pointer-events-none blur-3xl" />

      {/* Top Header & Navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        backendStatus={backendStatus} 
      />

      {/* Main Container */}
      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'inspector' && (
          <FlowInspector 
            onPredict={handlePredict} 
            prediction={currentPrediction} 
            isPredicting={isPredicting} 
          />
        )}

        {activeTab === 'explorer' && (
          <FlowExplorer 
            onSendToInspector={handleSendToInspector} 
          />
        )}

        {activeTab === 'batch' && (
          <BatchAnalyzer />
        )}

        {activeTab === 'pca' && (
          <ClusterLab 
            currentInspection={currentPrediction} 
          />
        )}

        {activeTab === 'metrics' && (
          <ModelMethodology />
        )}
      </main>

      {/* Bespoke Luxury Footer */}
      <footer className="border-t border-white/[0.06] bg-[#09090b]/90 py-6 text-xs text-zinc-500 font-mono backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="text-zinc-400 font-medium tracking-tight">AEGIS TELEMETRY PLATFORM • UNIT 3 ACADEMIC RESEARCH</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-zinc-500">
            <span>CICIDS2017 Benchmark</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">97.22% Attack Recall</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">F1: 0.7029</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
