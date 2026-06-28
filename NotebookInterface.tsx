"use client";

import React, { useState } from 'react';
import { usePyodide } from '@/components/pyodide/PyodideProvider';
import { useHumanDesign } from '@/hooks/useHumanDesign';
import ReactMarkdown from 'react-markdown';

interface NotebookEntry {
  id: string;
  timestamp: string;
  type: 'observation' | 'hypothesis' | 'spell' | 'reflection' | 'divination';
  content: string;
  tags: string[];
  resonance_score: number;
}

export function NotebookInterface() {
  const { runPythonAsync } = usePyodide();
  const { profile } = useHumanDesign();
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [entryType, setEntryType] = useState<NotebookEntry['type']>('observation');
  const [isDivining, setIsDivining] = useState(false);

  const addEntry = async () => {
    if (!currentEntry.trim()) return;
    const entry: NotebookEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: entryType,
      content: currentEntry,
      tags: [],
      resonance_score: Math.random(),
    };
    setEntries(prev => [entry, ...prev]);
    setCurrentEntry('');
  };

  const castIChing = async () => {
    setIsDivining(true);
    const iChingCode = `
import random
import json

def cast_hexagram():
    lines = []
    for i in range(6):
        coins = [random.choice([2, 3]) for _ in range(3)]
        total = sum(coins)
        if total == 6:
            lines.append({"value": 6, "type": "old_yin", "changing": True, "symbol": "---x---"})
        elif total == 7:
            lines.append({"value": 7, "type": "young_yang", "changing": False, "symbol": "---------"})
        elif total == 8:
            lines.append({"value": 8, "type": "young_yin", "changing": False, "symbol": "--- ---"})
        elif total == 9:
            lines.append({"value": 9, "type": "old_yang", "changing": True, "symbol": "----o----"})

    primary_binary = ''.join(str(line["value"] % 2) for line in reversed(lines))
    primary_number = int(primary_binary, 2) + 1 if primary_binary else 1

    hexagram_names = {
        1: "Ch'ien / The Creative", 2: "K'un / The Receptive", 3: "Chun / Difficulty at the Beginning",
        4: "Mêng / Youthful Folly", 5: "Hsu / Waiting", 6: "Sung / Conflict",
        7: "Shih / The Army", 8: "Pi / Holding Together", 9: "Hsiao Ch'u / The Taming Power of the Small",
        10: "Lu / Treading", 11: "T'ai / Peace", 12: "P'i / Standstill",
        13: "T'ung Jên / Fellowship", 14: "Ta Yu / Possession in Great Measure",
        15: "Ch'ien / Modesty", 16: "Yu / Enthusiasm", 17: "Sui / Following",
        18: "Ku / Work on the Decayed", 19: "Lin / Approach", 20: "Kuan / Contemplation",
        21: "Shih Ho / Biting Through", 22: "Pi / Grace", 23: "Po / Splitting Apart",
        24: "Fu / Return", 25: "Wu Wang / Innocence", 26: "Ta Ch'u / The Taming Power of the Great",
        27: "I / The Corners of the Mouth", 28: "Ta Kuo / Preponderance of the Great",
        29: "K'an / The Abysmal", 30: "Li / The Clinging", 31: "Hsien / Influence",
        32: "Hêng / Duration", 33: "Tun / Retreat", 34: "Ta Chuang / The Power of the Great",
        35: "Chin / Progress", 36: "Ming I / Darkening of the Light", 37: "Chia Jên / The Family",
        38: "K'uei / Opposition", 39: "Chien / Obstruction", 40: "Hsieh / Deliverance",
        41: "Sun / Decrease", 42: "I / Increase", 43: "Kuai / Break-through",
        44: "Kou / Coming to Meet", 45: "Ts'ui / Gathering Together", 46: "Shêng / Pushing Upward",
        47: "K'un / Oppression", 48: "Ching / The Well", 49: "Ko / Revolution",
        50: "Ting / The Cauldron", 51: "Chên / The Arousing", 52: "Kên / Keeping Still",
        53: "Chien / Development", 54: "Kuei Mei / The Marrying Maiden", 55: "Fêng / Abundance",
        56: "Lu / The Wanderer", 57: "Sun / The Gentle", 58: "Tui / The Joyous",
        59: "Huan / Dispersion", 60: "Chieh / Limitation", 61: "Chung Fu / Inner Truth",
        62: "Hsiao Kuo / Preponderance of the Small", 63: "Chi Chi / After Completion",
        64: "Wei Chi / Before Completion"
    }

    changing_lines = [i+1 for i, line in enumerate(lines) if line["changing"]]

    result = {
        "lines": lines,
        "primary_hexagram": hexagram_names.get(primary_number, "Unknown"),
        "primary_number": primary_number,
        "changing_lines": changing_lines,
        "reading": "The Creative works sublime success, furthering through perseverance."
    }
    return json.dumps(result)

cast_hexagram()
    `;

    try {
      const result = await runPythonAsync(iChingCode);
      const reading = JSON.parse(result);
      const entry: NotebookEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'divination',
        content: `## I Ching Reading\n\n**Primary Hexagram:** ${reading.primary_hexagram} (${reading.primary_number})\n\n**Lines:**\n${reading.lines.map((l: any) => `- ${l.symbol} (${l.type})`).join('\n')}\n\n**Changing Lines:** ${reading.changing_lines.length > 0 ? reading.changing_lines.join(', ') : 'None'}\n\n**Reading:** ${reading.reading}`,
        tags: ['i-ching', 'divination', 'symbolic'],
        resonance_score: 0.85,
      };
      setEntries(prev => [entry, ...prev]);
    } catch (err) {
      console.error('Divination error:', err);
    } finally {
      setIsDivining(false);
    }
  };

  const getEntryStyle = (type: NotebookEntry['type']) => {
    const styles: Record<string, { bg: string; border: string; icon: string }> = {
      observation: { bg: 'bg-blue-900/20', border: 'border-blue-500/30', icon: '👁' },
      hypothesis: { bg: 'bg-purple-900/20', border: 'border-purple-500/30', icon: '🔮' },
      spell: { bg: 'bg-amber-900/20', border: 'border-amber-500/30', icon: '✨' },
      reflection: { bg: 'bg-green-900/20', border: 'border-green-500/30', icon: '💭' },
      divination: { bg: 'bg-red-900/20', border: 'border-red-500/30', icon: '☯' },
    };
    return styles[type] || styles.observation;
  };

  return (
    <div className="h-screen w-screen bg-aion-void flex flex-col">
      <div className="h-14 bg-aion-matter border-b border-aion-resonance flex items-center px-6 justify-between">
        <div className="text-aion-gold font-bold text-xl font-display">The Grimoire</div>
        <div className="flex gap-2">
          <button onClick={castIChing} disabled={isDivining}
            className="px-4 py-2 bg-aion-gold/20 text-aion-gold rounded-lg text-sm hover:bg-aion-gold/30 disabled:opacity-50">
            {isDivining ? 'Casting...' : '☯ Cast I Ching'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-64 bg-aion-matter border-r border-aion-resonance p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-aion-light/50 uppercase tracking-wider">Entry Type</label>
            {[
              { id: 'observation', label: 'Observation', desc: 'Record what you see' },
              { id: 'hypothesis', label: 'Hypothesis', desc: 'Propose an idea' },
              { id: 'spell', label: 'Spell', desc: 'Command or invocation' },
              { id: 'reflection', label: 'Reflection', desc: 'Contemplate and learn' },
            ].map((type) => (
              <button key={type.id} onClick={() => setEntryType(type.id as any)}
                className={`w-full text-left p-3 rounded-lg transition-all ${entryType === type.id ? 'bg-aion-energy border border-aion-resonance' : 'hover:bg-aion-energy/50'}`}>
                <div className="text-aion-light font-medium text-sm">{type.label}</div>
                <div className="text-aion-light/50 text-xs">{type.desc}</div>
              </button>
            ))}
          </div>
          <div className="pt-4 border-t border-aion-resonance">
            <div className="text-xs text-aion-light/50 uppercase tracking-wider mb-2">Stats</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-aion-light"><span>Entries</span><span>{entries.length}</span></div>
              <div className="flex justify-between text-aion-light"><span>Divinations</span><span>{entries.filter(e => e.type === 'divination').length}</span></div>
              <div className="flex justify-between text-aion-light"><span>Avg Resonance</span><span>{(entries.reduce((a, b) => a + b.resonance_score, 0) / Math.max(entries.length, 1) * 100).toFixed(0)}%</span></div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-aion-resonance">
            <div className="bg-aion-matter rounded-xl p-4 border border-aion-resonance">
              <textarea value={currentEntry} onChange={(e) => setCurrentEntry(e.target.value)}
                placeholder={`Enter your ${entryType}... (Markdown supported)`}
                className="w-full h-32 bg-transparent text-aion-light placeholder-aion-light/30 resize-none focus:outline-none" />
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-aion-light/50">{profile?.type} • {new Date().toLocaleDateString()}</div>
                <button onClick={addEntry}
                  className="px-4 py-2 bg-aion-pulse text-white rounded-lg text-sm hover:bg-aion-pulse/80">
                  Record Entry
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {entries.map((entry) => {
              const style = getEntryStyle(entry.type);
              return (
                <div key={entry.id} className={`${style.bg} border ${style.border} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{style.icon}</span>
                    <span className="text-xs text-aion-light/50 uppercase tracking-wider">{entry.type}</span>
                    <span className="text-xs text-aion-light/30 ml-auto">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{entry.content}</ReactMarkdown>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-aion-void rounded text-xs text-aion-light/60">#{tag}</span>
                    ))}
                    <span className="px-2 py-1 bg-aion-void rounded text-xs text-aion-pulse ml-auto">
                      Resonance: {(entry.resonance_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
            {entries.length === 0 && (
              <div className="text-center py-12 text-aion-light/30">
                <div className="text-4xl mb-4">📖</div>
                <p>Your grimoire is empty. Begin recording observations, hypotheses, and spells.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
