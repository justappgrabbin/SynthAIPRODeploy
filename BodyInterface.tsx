"use client";

import React, { useEffect, useRef } from 'react';
import { useHumanDesign } from '@/hooks/useHumanDesign';
import { useMesh } from '@/hooks/useMesh';

export function BodyInterface() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { profile } = useHumanDesign();
  const { nodes } = useMesh();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    const centers = [
      { name: 'Head', x: width * 0.5, y: height * 0.1, color: '#9b59b6', defined: profile?.centers?.defined?.includes('Head') },
      { name: 'Ajna', x: width * 0.5, y: height * 0.2, color: '#3498db', defined: profile?.centers?.defined?.includes('Ajna') },
      { name: 'Throat', x: width * 0.5, y: height * 0.3, color: '#2ecc71', defined: profile?.centers?.defined?.includes('Throat') },
      { name: 'G-Center', x: width * 0.5, y: height * 0.45, color: '#f1c40f', defined: profile?.centers?.defined?.includes('G-Center') },
      { name: 'Heart', x: width * 0.35, y: height * 0.45, color: '#e74c3c', defined: profile?.centers?.defined?.includes('Heart') },
      { name: 'Solar Plexus', x: width * 0.65, y: height * 0.45, color: '#e67e22', defined: profile?.centers?.defined?.includes('Solar Plexus') },
      { name: 'Sacral', x: width * 0.5, y: height * 0.6, color: '#d35400', defined: profile?.centers?.defined?.includes('Sacral') },
      { name: 'Spleen', x: width * 0.35, y: height * 0.6, color: '#1abc9c', defined: profile?.centers?.defined?.includes('Spleen') },
      { name: 'Root', x: width * 0.5, y: height * 0.75, color: '#c0392b', defined: profile?.centers?.defined?.includes('Root') },
    ];

    const connections = [
      ['Head', 'Ajna'], ['Ajna', 'Throat'], ['Throat', 'G-Center'],
      ['Throat', 'Heart'], ['Throat', 'Solar Plexus'], ['Heart', 'G-Center'],
      ['Solar Plexus', 'G-Center'], ['G-Center', 'Sacral'],
      ['Heart', 'Sacral'], ['Solar Plexus', 'Sacral'],
      ['Sacral', 'Spleen'], ['Sacral', 'Root'], ['Spleen', 'Root'],
    ];

    ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
    ctx.lineWidth = 2;
    connections.forEach(([a, b]) => {
      const centerA = centers.find(c => c.name === a);
      const centerB = centers.find(c => c.name === b);
      if (centerA && centerB) {
        ctx.beginPath();
        ctx.moveTo(centerA.x, centerA.y);
        ctx.lineTo(centerB.x, centerB.y);
        ctx.stroke();
      }
    });

    centers.forEach((center) => {
      const radius = 30;
      if (center.defined) {
        const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius * 2);
        gradient.addColorStop(0, center.color + '60');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = center.defined ? center.color : center.color + '40';
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = center.defined ? '#fff' : center.color + '60';
      ctx.lineWidth = center.defined ? 3 : 1;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(center.name, center.x, center.y + radius + 15);

      const centerFiles = nodes.filter(n => {
        const domain = n.properties?.domain_tags?.[0];
        return domain && center.name.toLowerCase().includes(domain);
      });
      if (centerFiles.length > 0) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(centerFiles.length.toString(), center.x, center.y + 5);
      }
    });

    nodes.forEach((node, i) => {
      const angle = (i / Math.max(nodes.length, 1)) * Math.PI * 2;
      const orbitRadius = 150 + (i % 3) * 50;
      const x = width * 0.5 + Math.cos(angle) * orbitRadius;
      const y = height * 0.5 + Math.sin(angle) * orbitRadius;
      ctx.fillStyle = '#e94560';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [profile, nodes]);

  return (
    <div className="h-screen w-screen bg-aion-void flex flex-col">
      <div className="h-14 bg-aion-matter border-b border-aion-resonance flex items-center px-6 justify-between">
        <div className="text-aion-pulse font-bold text-xl">The Vessel</div>
        <div className="text-aion-light/50 text-sm">
          {profile?.type || 'Unknown'} • {profile?.profile || 'Unknown'} • {nodes.length} files in circulation
        </div>
      </div>
      <div className="flex-1 relative">
        <canvas ref={canvasRef} width={1200} height={800} className="w-full h-full" />
        <div className="absolute top-4 left-4 bg-aion-matter/80 backdrop-blur rounded-xl p-4 border border-aion-resonance max-w-xs">
          <h3 className="text-aion-light font-bold mb-2">Bodygraph Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-aion-light/50">Type</span><span className="text-aion-light">{profile?.type || 'Not calculated'}</span></div>
            <div className="flex justify-between"><span className="text-aion-light/50">Strategy</span><span className="text-aion-light">{profile?.strategy || 'Unknown'}</span></div>
            <div className="flex justify-between"><span className="text-aion-light/50">Authority</span><span className="text-aion-light">{profile?.authority || 'Unknown'}</span></div>
            <div className="flex justify-between"><span className="text-aion-light/50">Defined Centers</span><span className="text-aion-pulse">{profile?.centers?.defined?.length || 0}/9</span></div>
            <div className="flex justify-between"><span className="text-aion-light/50">Active Gates</span><span className="text-aion-pulse">{profile?.gates?.length || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
