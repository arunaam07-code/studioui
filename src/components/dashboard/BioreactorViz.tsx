"use client"

import React from 'react';
import { cn } from '@/lib/utils';
import { Cpu, Bluetooth, BluetoothOff } from 'lucide-react';

interface BioreactorVizProps {
  status: 'SAFE' | 'WARNING' | 'ALERT';
  isBluetoothConnected?: boolean;
}

export function BioreactorViz({ status, isBluetoothConnected = true }: BioreactorVizProps) {
  const statusColor = {
    SAFE: 'text-blue-500',
    WARNING: 'text-amber-500',
    ALERT: 'text-primary'
  }[status];

  return (
    <div className="relative w-full aspect-video max-w-[800px] mx-auto flex items-center justify-center p-4 bg-white rounded-xl shadow-lg border border-border overflow-hidden">
      <div className="scanline" />
      
      <svg viewBox="0 0 500 350" className="w-full h-full">
        {/* Thermal Jacket (Outer Wall) */}
        <path
          d="M180 60 L180 280 C180 310, 320 310, 320 280 L320 60 Z"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="6"
        />
        
        {/* Inner Reactor Tank - SEALED TOP */}
        <path
          d="M190 70 L190 275 C190 300, 310 300, 310 275 L310 70 Z"
          fill="rgba(59, 130, 246, 0.03)"
          stroke="currentColor"
          strokeWidth="3"
          className={cn("transition-colors duration-500", statusColor)}
        />

        {/* Medium (Liquid Content) */}
        <path
          d="M192 140 L192 275 C192 295, 308 295, 308 275 L308 140 Z"
          fill="rgba(59, 130, 246, 0.15)"
          className="animate-pulse"
        />

        {/* Agitation System */}
        <rect x="235" y="30" width="30" height="30" rx="2" fill="#64748b" />
        <line x1="250" y1="60" x2="250" y2="260" stroke="#94a3b8" strokeWidth="4" />
        
        {/* Rotating Paddles */}
        <g className="animate-spin-slow origin-[250px_230px]">
          <path d="M210 225 L290 225 L290 235 L210 235 Z" fill="currentColor" className="text-primary/30" />
          <path d="M245 200 L255 200 L255 260 L245 260 Z" fill="currentColor" className="text-primary/30" opacity="0.5" />
        </g>

        {/* Inoculation Port (Top Left Edge) */}
        <g>
          <rect x="205" y="50" width="10" height="20" rx="1" fill="#94a3b8" />
          <rect x="202" y="45" width="16" height="6" rx="1" fill="#64748b" />
          <text x="210" y="40" textAnchor="middle" className="text-[7px] font-mono font-black fill-slate-400 uppercase tracking-tighter">INOC PORT</text>
        </g>

        {/* Straight Probes (Vertical entry from top-right) */}
        <g className={cn("transition-colors duration-500", statusColor)}>
          {/* Probe 1 */}
          <line x1="285" y1="70" x2="285" y2="160" stroke="currentColor" strokeWidth="2" />
          <circle cx="285" cy="160" r="3" fill="currentColor" />
          
          {/* Probe 2 */}
          <line x1="300" y1="70" x2="300" y2="190" stroke="currentColor" strokeWidth="2" opacity="0.8" />
          <circle cx="300" cy="190" r="3" fill="currentColor" />
        </g>

        {/* Enhanced Embedded System (Control Module) */}
        <g transform="translate(325, 65)">
          {/* Main Housing with depth */}
          <rect x="0" y="0" width="75" height="70" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
          <rect x="2" y="2" width="71" height="66" rx="3" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          
          {/* Header Bar */}
          <rect x="0" y="0" width="75" height="16" rx="4" fill="currentColor" className="text-primary" />
          <text x="37.5" y="11" textAnchor="middle" className="text-[6px] font-mono font-black fill-white uppercase tracking-tighter">FLEET CORE</text>
          
          {/* Mode Indicators / Switched Modules */}
          <g transform="translate(6, 22)">
            {/* Module Segment 1 */}
            <rect x="0" y="0" width="30" height="18" rx="2" fill="#eff6ff" stroke="#dbeafe" strokeWidth="1" />
            <circle cx="26" cy="4" r="1.5" fill="#10b981" className="animate-pulse" />
            
            {/* Module Segment 2 */}
            <rect x="33" y="0" width="30" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="56" y="3" width="3" height="3" fill={isBluetoothConnected ? "#3b82f6" : "#cbd5e1"} className={cn(isBluetoothConnected && "animate-pulse")} />
          </g>

          {/* Digital Interface / Bitstream Mockup */}
          <g transform="translate(6, 46)">
             <rect x="0" y="0" width="63" height="18" rx="2" fill="#0f172a" />
             <rect x="4" y="6" width="2" height="6" fill="#3b82f6" opacity="0.8" className="animate-pulse" />
             <rect x="8" y="4" width="2" height="10" fill="#3b82f6" opacity="0.4" />
             <rect x="12" y="7" width="2" height="4" fill="#3b82f6" opacity="0.9" />
             <rect x="16" y="5" width="2" height="8" fill="#3b82f6" opacity="0.3" />
             <rect x="20" y="8" width="2" height="3" fill="#3b82f6" opacity="0.6" />
             
             {/* Small Bluetooth Icon Overlay */}
             <g transform="translate(48, 2) scale(0.3)" className={isBluetoothConnected ? "text-primary" : "text-slate-600"}>
               <path d="M7 7l10 10-5 5V2l5 5L7 17" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
             </g>
          </g>
        </g>

        {/* Discrete Connections from System to Probes */}
        <path d="M325 85 L300 85" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5,3" />
        <path d="M325 95 L285 95" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5,3" />

        {/* Inlet/Outlet Pipes */}
        <path d="M120 80 H180" stroke="#94a3b8" strokeWidth="4" />
        <path d="M320 260 H380" stroke="#94a3b8" strokeWidth="4" />

        {/* Bubbles */}
        <g>
          <circle cx="220" cy="270" r="2" fill="#3b82f6" className="bubble" style={{ animationDelay: '0s' }} />
          <circle cx="280" cy="250" r="3" fill="#3b82f6" className="bubble" style={{ animationDelay: '1.2s' }} />
          <circle cx="240" cy="280" r="2" fill="#3b82f6" className="bubble" style={{ animationDelay: '2.5s' }} />
        </g>

        {/* Labels */}
        <text x="70" y="75" className="text-[9px] fill-slate-400 font-mono font-bold uppercase tracking-widest">FEED IN</text>
        <text x="390" y="265" className="text-[9px] fill-slate-400 font-mono font-bold uppercase tracking-widest">EFFLUENT</text>
        <text x="250" y="20" textAnchor="middle" className="text-[9px] fill-slate-400 font-mono font-bold uppercase tracking-widest">AGITATOR DRIVE</text>
      </svg>

      {/* Real-time Indicator Overlays */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
          <div className={cn("h-2 w-2 rounded-full", isBluetoothConnected ? "bg-blue-500 animate-pulse" : "bg-slate-300")} />
          <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
            {isBluetoothConnected ? "Wireless Uplink Active" : "Local Data Logging Only"}
          </span>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200">
        <div className="p-2 bg-blue-50 rounded-md">
          {isBluetoothConnected ? <Bluetooth className="h-4 w-4 text-primary" /> : <BluetoothOff className="h-4 w-4 text-slate-400" />}
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Protocol</span>
          <span className="text-xs font-bold font-mono text-primary uppercase">
            {isBluetoothConnected ? "Bluetooth 5.0" : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
}
