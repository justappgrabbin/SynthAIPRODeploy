"use client";

import React, { useState } from 'react';
import { OSInterface } from '@/components/interfaces/OSInterface';
import { BodyInterface } from '@/components/interfaces/BodyInterface';
import { NotebookInterface } from '@/components/interfaces/NotebookInterface';
import { useHumanDesign } from '@/hooks/useHumanDesign';

export default function Home() {
  const [mode, setMode] = useState<'os' | 'body' | 'notebook'>('os');
  const { profile } = useHumanDesign();

  return (
    <div className="h-screen w-screen bg-aion-void overflow-hidden">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-aion-matter/80 backdrop-blur rounded-full p-1 border border-aion-resonance">
        {[
          { id: 'os', label: 'Cortex', icon: '◈' },
          { id: 'body', label: 'Vessel', icon: '◉' },
          { id: 'notebook', label: 'Grimoire', icon: '◊' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${mode === m.id ? 'bg-aion-pulse text-white' : 'text-aion-light/60 hover:text-aion-light'}
            `}
          >
            <span className="mr-2">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {profile && (
        <div className="fixed top-4 right-4 z-50 bg-aion-matter/80 backdrop-blur rounded-lg px-3 py-2 border border-aion-resonance">
          <span className="text-xs text-aion-light/50">{profile.type}</span>
          <span className="text-xs text-aion-pulse ml-2">{profile.profile}</span>
        </div>
      )}

      {mode === 'os' && <OSInterface />}
      {mode === 'body' && <BodyInterface />}
      {mode === 'notebook' && <NotebookInterface />}
    </div>
  );
}
