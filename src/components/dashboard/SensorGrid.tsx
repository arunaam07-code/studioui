"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  Gauge, 
  Zap, 
  FlaskConical, 
  Waves, 
  Beaker,
  Bluetooth,
  BluetoothOff
} from 'lucide-react';
import { SensorData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SensorGridProps {
  data: SensorData;
  isBluetoothConnected?: boolean;
  className?: string;
}

export function SensorGrid({ data, isBluetoothConnected = true, className }: SensorGridProps) {
  const sensors = [
    { label: 'Temperature', value: `${data.temperature.toFixed(1)}°C`, icon: Thermometer, color: 'text-blue-500' },
    { label: 'pH Level', value: data.pH.toFixed(2), icon: FlaskConical, color: 'text-blue-600' },
    { label: 'Flowrate', value: `${data.flowrate.toFixed(1)} L/m`, icon: Waves, color: 'text-blue-400' },
    { label: 'BOD Content', value: `${data.BOD.toFixed(0)} mg/L`, icon: Droplets, color: 'text-indigo-500' },
    { label: 'COD Index', value: `${data.COD.toFixed(0)} mg/L`, icon: Activity, color: 'text-indigo-600' },
    { label: 'Turbidity', value: `${data.turbidity.toFixed(1)} NTU`, icon: Beaker, color: 'text-cyan-500' },
    { label: 'Conductivity', value: `${data.conductivity.toFixed(0)} µS`, icon: Zap, color: 'text-blue-500' },
    { label: 'Gas Density', value: `${data.gasLevelPpm.toFixed(0)} ppm`, icon: Gauge, color: 'text-slate-600' },
    { label: 'Ambient Hum', value: `${data.humidity.toFixed(1)}%`, icon: Wind, color: 'text-slate-400' },
  ];

  return (
    <div className={cn("grid gap-4", className)}>
      <Card className={cn(
        "border-slate-200 shadow-sm transition-all overflow-hidden",
        isBluetoothConnected ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-slate-200"
      )}>
        <CardContent className="p-4 flex items-center gap-4">
          <div className={cn(
            "p-2.5 rounded-lg border",
            isBluetoothConnected ? "bg-white border-primary/20 text-primary" : "bg-white border-slate-200 text-slate-400"
          )}>
            {isBluetoothConnected ? <Bluetooth className="h-5 w-5 animate-pulse" /> : <BluetoothOff className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Link Status</p>
            <p className={cn(
              "text-sm font-black font-mono uppercase",
              isBluetoothConnected ? "text-primary" : "text-slate-500"
            )}>
              {isBluetoothConnected ? "Connected" : "No Link"}
            </p>
          </div>
        </CardContent>
      </Card>

      {sensors.map((sensor) => (
        <Card key={sensor.label} className="bg-white border-slate-200 shadow-sm hover:border-primary/50 transition-all group overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-blue-50 transition-colors">
              <sensor.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", sensor.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{sensor.label}</p>
              <p className="text-base font-black font-mono text-slate-900 truncate">{sensor.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
