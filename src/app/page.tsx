"use client"

import React, { useState, useEffect, useRef } from 'react';
import { BioreactorViz } from '@/components/dashboard/BioreactorViz';
import { SensorGrid } from '@/components/dashboard/SensorGrid';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { AIInsight } from '@/components/dashboard/AIInsight';
import {
  SensorData,
  HistoricalReading,
  ReactorStatus,
  PlasticAnalysisResult,
  ReactorInstance,
  PyrolysisInstance,
  Contaminant,
  ByproductData
} from '@/lib/types';
import {
  AlertTriangle,
  Activity,
  Zap,
  Cpu,
  Microscope,
  Network,
  Upload,
  Camera,
  CheckCircle2,
  ArrowRight,
  FileSearch,
  Dna,
  Plus,
  LayoutGrid,
  ChevronRight,
  Bluetooth,
  BluetoothOff,
  Trash2,
  ShieldAlert,
  Beaker,
  AlertCircle,
  FlaskConical,
  Scale,
  Flame,
  Thermometer,
  Wind,
  ShieldCheck,
  Recycle,
  Waves,
  Droplets,
  Container,
  ArrowRightLeft,
  Sprout
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { analyzePlastic } from '@/ai/flows/analyze-plastic-flow';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AppStep = 'FLEET' | 'UPLOAD' | 'ANALYSIS' | 'DASHBOARD' | 'PYROLYSIS_DASHBOARD';

export default function App() {
  const [step, setStep] = useState<AppStep>('FLEET');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<PlasticAnalysisResult | null>(null);

  // Fleet states
  const [reactors, setReactors] = useState<ReactorInstance[]>([]);
  const [activeReactorId, setActiveReactorId] = useState<string | null>(null);

  // Pyrolysis Fleet
  const [pyrolysisUnits, setPyrolysisUnits] = useState<PyrolysisInstance[]>([]);
  const [activePyrolysisId, setActivePyrolysisId] = useState<string | null>(null);

  const activeReactor = reactors.find(r => r.id === activeReactorId);
  const activePyrolysis = pyrolysisUnits.find(p => p.id === activePyrolysisId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if current analysis has organic contaminants requiring pyrolysis
  const pyrolysisContaminant = analysisResult?.segregationReport.detectedContaminants.find(
    c => c.suggestedRoute === 'PYROLYSIS' || c.category === 'ORGANIC'
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        startAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async (imageData: string) => {
    setStep('ANALYSIS');
    setAnalysisProgress(0);
    setAnalysisResult(null);

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 5;
      });
    }, 200);

    try {
      const result = await analyzePlastic({ photoDataUri: imageData });
      setAnalysisResult(result);
      setAnalysisProgress(100);
      clearInterval(progressInterval);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      const isQuotaError = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      toast({
        variant: "destructive",
        title: isQuotaError ? "API Quota Exceeded" : "Analysis Failed",
        description: isQuotaError
          ? "The AI processing limit has been reached. Please wait a minute and try again."
          : "Could not characterize the waste stream. Please try a different image.",
      });
      setStep('UPLOAD');
      clearInterval(progressInterval);
    }
  };

  const initializeReactor = () => {
    if (!analysisResult) return;

    const newReactor: ReactorInstance = {
      id: `BV-${Math.floor(Math.random() * 10000)}`,
      name: `Reactor ${reactors.length + 1}`,
      analysisResult,
      currentData: {
        temperature: 32.5,
        pH: 7.2,
        flowrate: 15.0,
        BOD: 250,
        COD: 600,
        turbidity: 45.2,
        conductivity: 1200,
        gasLevelPpm: 210,
        humidity: 55.0,
      },
      byproducts: {
        biogasVolume: 0,
        processedBiomass: 0,
        liquidEffluent: 0,
      },
      history: [],
      status: 'SAFE',
      startTime: new Date().toISOString(),
      isBluetoothConnected: true,
    };

    setReactors(prev => [...prev, newReactor]);
    setActiveReactorId(newReactor.id);
    setStep('DASHBOARD');
    setAnalysisResult(null);
    setSelectedImage(null);
  };

  const redirectToPyrolysis = (contaminant: Contaminant) => {
    const newPyrolysis: PyrolysisInstance = {
      id: `PY-${Math.floor(Math.random() * 10000)}`,
      contaminantLabel: contaminant.label,
      currentData: {
        temperature: 450,
        pressure: 1.2,
        charYield: 25,
        oilYield: 35,
        gasYield: 40,
      },
      history: [],
      status: 'HEATING',
    };

    setPyrolysisUnits(prev => [...prev, newPyrolysis]);
    setActivePyrolysisId(newPyrolysis.id);
    setStep('PYROLYSIS_DASHBOARD');
    setAnalysisResult(null);
    setSelectedImage(null);
    toast({
      title: "Redirection Successful",
      description: `${contaminant.label} sent to Pyrolytic Chamber ${newPyrolysis.id}`,
    });
  };


  // Live data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Bioreactors
      setReactors(prevReactors => prevReactors.map(reactor => {
        const newData: SensorData = {
          temperature: 30 + Math.random() * 5,
          pH: 7.0 + Math.random() * 0.4,
          flowrate: 14 + Math.random() * 2,
          BOD: 240 + Math.random() * 20,
          COD: 590 + Math.random() * 20,
          turbidity: 42 + Math.random() * 6,
          conductivity: 1180 + Math.random() * 40,
          gasLevelPpm: 200 + Math.random() * 60,
          humidity: 52 + Math.random() * 6,
        };

        const newByproducts: ByproductData = {
          biogasVolume: reactor.byproducts.biogasVolume + (Math.random() * 0.5),
          processedBiomass: reactor.byproducts.processedBiomass + (Math.random() * 0.1),
          liquidEffluent: reactor.byproducts.liquidEffluent + (Math.random() * 0.2),
        };

        const reading: HistoricalReading = { ...newData, timestamp: new Date().toISOString() };
        let newStatus: ReactorStatus = 'SAFE';
        if (newData.gasLevelPpm > 250 || newData.temperature > 37) newStatus = 'ALERT';
        else if (newData.gasLevelPpm > 235 || newData.temperature > 34) newStatus = 'WARNING';

        return {
          ...reactor,
          currentData: newData,
          byproducts: newByproducts,
          history: [...reactor.history.slice(-49), reading],
          status: newStatus
        };
      }));

      // Pyrolysis Units
      setPyrolysisUnits(prevUnits => prevUnits.map(unit => ({
        ...unit,
        currentData: {
          temperature: 450 + Math.random() * 20,
          pressure: 1.1 + Math.random() * 0.3,
          charYield: 24 + Math.random() * 2,
          oilYield: 34 + Math.random() * 2,
          gasYield: 39 + Math.random() * 2,
        },
        history: [...unit.history.slice(-49), { ...unit.currentData, timestamp: new Date().toISOString() }],
        status: 'STABLE'
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-900">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStep('FLEET')}>
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <ArrowRightLeft className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-slate-900 uppercase">BIOVALOUR</h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase -mt-1 tracking-tight">Waste to Wealth</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('FLEET')} className="text-[10px] font-bold uppercase tracking-widest h-8 gap-2">
              <LayoutGrid className="h-3.5 w-3.5" />
              Overview
            </Button>
            <Button variant="default" size="sm" onClick={() => setStep('UPLOAD')} className="text-[10px] font-bold uppercase tracking-widest h-8 gap-2">
              <Plus className="h-3.5 w-3.5" />
              New Analysis
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {step === 'FLEET' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">OPERATIONAL OVERVIEW</Badge>
                <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Process Fleet</h2>
              </div>
            </div>

            <Tabs defaultValue="bioreactors" className="w-full">
              <TabsList className="bg-slate-100 p-1 mb-6">
                <TabsTrigger value="bioreactors" className="font-black text-[10px] uppercase tracking-widest py-2 px-6">Bioreactors ({reactors.length})</TabsTrigger>
                <TabsTrigger value="pyrolysis" className="font-black text-[10px] uppercase tracking-widest py-2 px-6">Pyrolytic Units ({pyrolysisUnits.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="bioreactors">
                {reactors.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <Container className="h-10 w-10 text-slate-300" />
                    <h3 className="text-xl font-black text-slate-900 uppercase">No Active Bioprocesses</h3>
                    <Button onClick={() => setStep('UPLOAD')} size="lg" className="font-black uppercase tracking-widest">Start First Scan</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {reactors.map(reactor => (
                      <Card key={reactor.id} className="group hover:border-primary/50 transition-all cursor-pointer shadow-sm" onClick={() => { setActiveReactorId(reactor.id); setStep('DASHBOARD'); }}>
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-black uppercase">{reactor.name}</CardTitle>
                            <Badge variant={reactor.status === 'SAFE' ? 'secondary' : 'destructive'}>{reactor.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 text-xs">
                            <div>
                              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Polymer</p>
                              <p className="font-black truncate">{reactor.analysisResult.plasticType}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Agent</p>
                              <p className="font-black text-emerald-600 truncate">{reactor.analysisResult.recommendedMicrobe}</p>
                            </div>
                          </div>
                          <Progress value={Math.min(100, (reactor.byproducts.processedBiomass / 10) * 100)} className="h-1.5" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pyrolysis">
                {pyrolysisUnits.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <Flame className="h-10 w-10 text-slate-300" />
                    <h3 className="text-xl font-black text-slate-900 uppercase">No Pyrolysis Tasks</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">Organic contaminants like medical cotton are redirected here for thermal valorisation.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pyrolysisUnits.map(unit => (
                      <Card key={unit.id} className="group hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm border-l-4 border-l-orange-500" onClick={() => { setActivePyrolysisId(unit.id); setStep('PYROLYSIS_DASHBOARD'); }}>
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-black uppercase tracking-tight">CHAMBER {unit.id}</CardTitle>
                            <Badge className="bg-emerald-600 text-white border-none">{unit.status}</Badge>
                          </div>
                          <CardDescription className="text-[10px] font-bold text-slate-400 uppercase">LOAD: {unit.contaminantLabel}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 text-xs">
                            <div>
                              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Thermal</p>
                              <p className="font-black truncate">{unit.currentData.temperature.toFixed(0)}°C</p>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Total Yield</p>
                              <p className="font-black text-emerald-600 truncate">{(unit.currentData.oilYield + unit.currentData.charYield).toFixed(0)}%</p>
                            </div>
                          </div>
                          <Progress value={unit.currentData.oilYield + unit.currentData.charYield} className="h-1.5 bg-emerald-100" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {step === 'UPLOAD' && (
          <div className="max-w-2xl mx-auto space-y-8 text-center animate-in fade-in">
            <Badge className="bg-primary/10 text-primary px-4 py-1 mb-4 uppercase tracking-[0.2em] font-black">PHASE 01: CHARACTERIZATION</Badge>
            <h2 className="text-4xl font-black uppercase text-slate-900">New Scan Protocol</h2>
            <Card className="border-dashed border-2 border-slate-200 bg-white py-20 cursor-pointer hover:border-primary/50 transition-all" onClick={() => fileInputRef.current?.click()}>
              <CardContent className="flex flex-col items-center gap-6">
                <Camera className="h-12 w-12 text-primary" />
                <p className="font-black text-lg uppercase">Scan Trash</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'ANALYSIS' && analysisResult && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <Badge className="bg-primary/10 text-primary px-4 py-1 uppercase font-mono tracking-widest">Spectral Scan Active...</Badge>
                <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                  {selectedImage && <img src={selectedImage} alt="Analysis" className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>

              <div className="space-y-6">
                <Tabs defaultValue="polymer">
                  <TabsList className="w-full bg-slate-100 mb-6">
                    <TabsTrigger value="polymer" className="flex-1 font-black text-[10px] uppercase">Polymer Analysis</TabsTrigger>
                    <TabsTrigger value="segregation" className="flex-1 font-black text-[10px] uppercase">Segregation Required</TabsTrigger>
                  </TabsList>

                  <TabsContent value="polymer">
                    <Card className="p-6 space-y-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Plastic Type</label>
                        <p className="text-2xl font-black text-slate-900 uppercase">{analysisResult.plasticType}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Recommended Microbe</label>
                        <div className="flex items-center gap-2">
                          <Dna className="h-5 w-5 text-emerald-500" />
                          <p className="text-lg font-black text-emerald-600 uppercase">{analysisResult.recommendedMicrobe}</p>
                        </div>
                      </div>

                      {pyrolysisContaminant ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                            <ShieldAlert className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-xs font-black text-emerald-900 uppercase">Interference Detected</p>
                              <p className="text-[10px] text-emerald-700 leading-tight">
                                Organic contaminants identified. Bioreactor initialization is locked until stream is diverted to Pyrolytic Chamber.
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => redirectToPyrolysis(pyrolysisContaminant)}
                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-sm font-black uppercase gap-3 shadow-lg shadow-emerald-200"
                          >
                            Initialize Pyrolytic Protocol <Flame className="h-5 w-5" />
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={initializeReactor} className="w-full h-14 text-sm font-black uppercase gap-3">
                          Inoculate Bioreactor <ArrowRight className="h-5 w-5" />
                        </Button>
                      )}
                    </Card>
                  </TabsContent>

                  <TabsContent value="segregation">
                    <Card className="overflow-hidden">
                      <ScrollArea className="h-[400px]">
                        <div className="p-6 space-y-4">
                          {!analysisResult.segregationReport.hasContaminants ? (
                            <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
                              <ShieldCheck className="h-12 w-12 text-emerald-500/20" />
                              <p className="text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em]">Purity Verified: No Contaminants</p>
                            </div>
                          ) : (
                            analysisResult.segregationReport.detectedContaminants.map((item, idx) => (
                              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-3">
                                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", item.suggestedRoute === 'PYROLYSIS' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600")}>
                                      {item.suggestedRoute === 'PYROLYSIS' ? <Sprout className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase">{item.category}</p>
                                      <p className="text-sm font-black text-slate-900 uppercase">{item.label}</p>
                                    </div>
                                  </div>
                                  {item.isHazardous && <Badge variant="destructive" className="text-[8px] font-black">BIOHAZARD</Badge>}
                                </div>
                                <p className="text-[10px] font-mono text-slate-500 leading-relaxed italic border-l-2 border-slate-200 pl-3">"{item.recommendation}"</p>
                                {item.suggestedRoute === 'PYROLYSIS' && (
                                  <Button onClick={() => redirectToPyrolysis(item)} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest h-9">
                                    Redirect to Pyrolytic Chamber
                                  </Button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}

        {step === 'DASHBOARD' && activeReactor && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
            <div className="lg:col-span-9 space-y-8">
              <Tabs defaultValue="telemetry" className="w-full">
                <TabsList className="bg-slate-100 p-1 mb-4">
                  <TabsTrigger value="telemetry" className="font-black text-[10px] uppercase tracking-widest py-2 px-6">Live Telemetry</TabsTrigger>
                  <TabsTrigger value="byproducts" className="font-black text-[10px] uppercase tracking-widest py-2 px-6">Yields & Effluents</TabsTrigger>
                </TabsList>

                <TabsContent value="telemetry" className="space-y-8 mt-0">
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-4">
                      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Microscope className="h-4 w-4 text-primary" />
                        {activeReactor.name} Visualization
                      </h2>
                      <BioreactorViz status={activeReactor.status} isBluetoothConnected={activeReactor.isBluetoothConnected} />
                    </div>
                    <AIInsight currentReadings={activeReactor.currentData} historicalReadings={activeReactor.history} />
                  </div>
                  <TrendChart data={activeReactor.history} />
                </TabsContent>

                <TabsContent value="byproducts" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white shadow-sm border-emerald-100">
                      <CardContent className="p-8 space-y-4">
                        <div className="flex items-center justify-between">
                          <Wind className="h-6 w-6 text-emerald-500" />
                          <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px]">ACTIVE ACCUMULATION</Badge>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Biogas Volume</p>
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black text-slate-900">{activeReactor.byproducts.biogasVolume.toFixed(2)}</h3>
                            <span className="text-lg font-bold text-slate-400">Liters</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50">
                          <p className="text-[10px] font-mono text-slate-500 italic">Methane/CO2 recovery active.</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-blue-100">
                      <CardContent className="p-8 space-y-4">
                        <div className="flex items-center justify-between">
                          <Container className="h-6 w-6 text-blue-500" />
                          <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px]">POLYMER CONVERSION</Badge>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Processed Biomass</p>
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black text-slate-900">{activeReactor.byproducts.processedBiomass.toFixed(2)}</h3>
                            <span className="text-lg font-bold text-slate-400">kg</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50">
                          <p className="text-[10px] font-mono text-slate-500 italic">Target: {activeReactor.analysisResult.plasticType}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-indigo-100">
                      <CardContent className="p-8 space-y-4">
                        <div className="flex items-center justify-between">
                          <Waves className="h-6 w-6 text-indigo-500" />
                          <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[9px]">LIQUID EFFLUENT</Badge>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Byproduct Effluent</p>
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black text-slate-900">{activeReactor.byproducts.liquidEffluent.toFixed(2)}</h3>
                            <span className="text-lg font-bold text-slate-400">Liters</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50">
                          <p className="text-[10px] font-mono text-slate-500 italic">Secondary valorisation ready.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="lg:col-span-3">
              <SensorGrid data={activeReactor.currentData} isBluetoothConnected={activeReactor.isBluetoothConnected} />
            </div>
          </div>
        )}

        {step === 'PYROLYSIS_DASHBOARD' && activePyrolysis && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Flame className="text-white h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tight">Pyrolytic Chamber {activePyrolysis.id}</h2>
                <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Thermogravimetric Valorisation Center</p>
              </div>
            </div>

            <Tabs defaultValue="telemetry" className="w-full">
              <TabsList className="bg-slate-100 p-1 mb-6">
                <TabsTrigger value="telemetry" className="font-black text-[10px] uppercase tracking-widest py-2 px-6">Chamber Telemetry</TabsTrigger>
                <TabsTrigger value="yields" className="font-black text-[10px] uppercase tracking-widest py-2 px-6">Yield Recovery</TabsTrigger>
              </TabsList>

              <TabsContent value="telemetry" className="space-y-8 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white border-emerald-100 shadow-sm">
                    <CardContent className="p-6 space-y-2">
                      <div className="flex justify-between items-center text-emerald-600">
                        <Thermometer className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Reactor Core Temp</span>
                      </div>
                      <p className="text-4xl font-black font-mono text-slate-900">{activePyrolysis.currentData.temperature.toFixed(0)}°C</p>
                      <Badge className="bg-emerald-50 text-emerald-700 border-none font-mono">STABLE THERMAL</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-blue-100 shadow-sm">
                    <CardContent className="p-6 space-y-2">
                      <div className="flex justify-between items-center text-blue-500">
                        <Wind className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Internal Pressure</span>
                      </div>
                      <p className="text-4xl font-black font-mono text-slate-900">{activePyrolysis.currentData.pressure.toFixed(2)} Bar</p>
                      <Badge className="bg-blue-100 text-blue-600 border-none font-mono">VACUUM SEALED</Badge>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-900 text-white p-10 rounded-3xl overflow-hidden relative border-none">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-6 max-w-lg">
                      <Badge className="bg-emerald-600 text-white border-none font-black px-4 py-1">THERMAL DECOMPOSITION ACTIVE</Badge>
                      <h3 className="text-4xl font-black uppercase tracking-tighter">Valorisation Protocol: {activePyrolysis.contaminantLabel}</h3>
                      <p className="text-slate-400 font-mono text-sm leading-relaxed">
                        System is currently processing redirected organic contaminants. The pyrolysis chamber maintains a high-temperature, anaerobic environment to break down polymers into recoverable fertilizers, bio-char, bio-oil, and synthetic gas.
                      </p>
                      <div className="flex gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                          <p className="text-[10px] font-black text-emerald-500 uppercase">Catalyst</p>
                          <p className="font-bold text-white">ZSM-5 Zeolite</p>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                          <p className="text-[10px] font-black text-emerald-500 uppercase">Environment</p>
                          <p className="font-bold text-white">N2 Purged</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative h-64 w-64 flex items-center justify-center">
                      <div className="absolute inset-0 bg-emerald-600/20 blur-[100px] animate-pulse" />
                      <Sprout className="h-32 w-32 text-emerald-400 animate-bounce" />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="yields" className="mt-0">
                <Card className="bg-white border-emerald-100 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Yield Characterization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-8">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono font-bold uppercase">
                        <span>Pyrolytic Oil (Vaporized)</span>
                        <span className="text-emerald-600">{activePyrolysis.currentData.oilYield.toFixed(1)}%</span>
                      </div>
                      <Progress value={activePyrolysis.currentData.oilYield} className="h-4 bg-emerald-50" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono font-bold uppercase">
                        <span>Bio-Char Output</span>
                        <span className="text-emerald-700">{activePyrolysis.currentData.charYield.toFixed(1)}%</span>
                      </div>
                      <Progress value={activePyrolysis.currentData.charYield} className="h-4 bg-emerald-50" />
                    </div>
                    <div className="pt-6 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Recovered Gas</p>
                        <p className="text-xl font-black text-slate-900">{activePyrolysis.currentData.gasYield.toFixed(1)}%</p>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Net Efficiency</p>
                        <p className="text-xl font-black text-emerald-700">{(activePyrolysis.currentData.oilYield + activePyrolysis.currentData.charYield + activePyrolysis.currentData.gasYield).toFixed(0)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 mt-20 py-10 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">© 2025 Biovalour Systems</span>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">Industrial Biovalour Fleet Core v3.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}