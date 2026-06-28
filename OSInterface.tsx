"use client";

import React, { useState } from 'react';
import { FileIngestionEngine } from '@/components/ingestion/FileIngestionEngine';
import { MeshGraph } from '@/components/mesh/MeshGraph';
import { AutolingEngine } from '@/components/autoling/AutolingEngine';
import { useHumanDesign } from '@/hooks/useHumanDesign';
import { IngestionResult, MeshNode } from '@/types';

export function OSInterface() {
  const [activeWindow, setActiveWindow] = useState<'ingest' | 'mesh' | 'autoling' | 'agent'>('ingest');
  const [ingestionResult, setIngestionResult] = useState<IngestionResult | null>(null);
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);
  const [progress, setProgress] = useState({ percent: 0, status: '' });
  const { profile } = useHumanDesign();

  const getThemeClass = () => {
    switch (profile?.type) {
      case 'Manifestor': return 'os-manifestor';
      case 'Generator': return 'os-generator';
      case 'Manifesting Generator': return 'os-mg';
      case 'Projector': return 'os-projector';
      case 'Reflector': return 'os-reflector';
      default: return 'os-default';
    }
  };

  return (
    <div className={`h-screen w-screen bg-aion-void flex flex-col ${getThemeClass()}`}>
      <div className="h-14 bg-aion-matter border-b border-aion-resonance flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="text-aion-pulse font-bold text-xl tracking-wider">AION</div>
          <div className="h-6 w-px bg-aion-resonance" />
          <div className="flex gap-2">
            {[
              { id: 'ingest', label: 'Ingest', icon: '↑' },
              { id: 'mesh', label: 'Mesh', icon: '◈' },
              { id: 'autoling', label: 'AutoLing', icon: '?' },
              { id: 'agent', label: 'Agent', icon: '◉' },
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveWindow(item.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeWindow === item.id ? 'bg-aion-pulse text-white' : 'text-aion-light/60 hover:text-aion-light hover:bg-aion-energy'}`}>
                <span className="mr-2">{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-aion-light/50">
          <span>Nodes: {ingestionResult?.nodes.length || 0}</span>
          <span>Resonance: Active</span>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        {activeWindow === 'ingest' && (
          <div className="h-full flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-aion-light">File Ingestion</h2>
              <p className="text-aion-light/50 text-sm">Drop your files. The system will parse, classify, and place them in the mesh.</p>
            </div>
            <FileIngestionEngine onIngestComplete={setIngestionResult}
              onProgress={(percent, status) => setProgress({ percent, status })} />
            {progress.percent > 0 && progress.percent < 100 && (
              <div className="bg-aion-matter rounded-lg p-4">
                <div className="flex justify-between text-sm text-aion-light mb-2">
                  <span>{progress.status}</span><span>{progress.percent.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-aion-energy rounded-full overflow-hidden">
                  <div className="h-full bg-aion-pulse transition-all duration-300" style={{ width: `${progress.percent}%` }} />
                </div>
              </div>
            )}
            {ingestionResult && (
              <div className="bg-aion-matter rounded-lg p-4 border border-aion-resonance">
                <h3 className="text-aion-light font-bold mb-2">Ingestion Complete</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="bg-aion-energy rounded-lg p-3">
                    <div className="text-aion-light/50">Total</div>
                    <div className="text-2xl font-bold text-aion-light">{ingestionResult.totalFiles}</div>
                  </div>
                  <div className="bg-aion-energy rounded-lg p-3">
                    <div className="text-aion-light/50">Processed</div>
                    <div className="text-2xl font-bold text-green-400">{ingestionResult.processedFiles}</div>
                  </div>
                  <div className="bg-aion-energy rounded-lg p-3">
                    <div className="text-aion-light/50">Failed</div>
                    <div className="text-2xl font-bold text-red-400">{ingestionResult.failedFiles}</div>
                  </div>
                  <div className="bg-aion-energy rounded-lg p-3">
                    <div className="text-aion-light/50">Domains</div>
                    <div className="text-lg font-bold text-aion-pulse">
                      {[...new Set(ingestionResult.nodes.flatMap(n => n.domain_tags))].length}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeWindow === 'mesh' && (
          <div className="h-full flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-aion-light">Neural Mesh</h2>
              <div className="flex gap-2">
                {['Force Layout', 'Hierarchical', 'Body Map'].map((layout) => (
                  <button key={layout} className="px-3 py-1 bg-aion-energy rounded-lg text-sm text-aion-light hover:bg-aion-resonance">{layout}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-aion-resonance">
              <MeshGraph onNodeSelect={setSelectedNode} />
            </div>
          </div>
        )}

        {activeWindow === 'autoling' && <div className="h-full"><AutolingEngine /></div>}

        {activeWindow === 'agent' && (
          <div className="h-full flex items-center justify-center text-aion-light/50">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-aion-energy flex items-center justify-center">
                <span className="text-4xl">◉</span>
              </div>
              <h2 className="text-xl font-bold text-aion-light mb-2">Your Agent</h2>
              <p>Personal AI extension learning and evolving with you</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
