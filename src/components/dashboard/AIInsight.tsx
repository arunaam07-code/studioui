"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Brain, Sparkles, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { AnomalyDetectionOutput, detectAnomalyAndPredict } from '@/ai/flows/anomaly-detection-and-prediction-flow';
import { SensorData, HistoricalReading } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AIInsightProps {
  currentReadings: SensorData;
  historicalReadings: HistoricalReading[];
}

export function AIInsight({ currentReadings, historicalReadings }: AIInsightProps) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<AnomalyDetectionOutput | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const result = await detectAnomalyAndPredict({
        currentReadings,
        historicalReadings
      });
      setInsight(result);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-white/5 bg-secondary/30 shadow-none overflow-hidden flex flex-col">
      <CardHeader className="bg-primary/5 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Neural Analysis
          </CardTitle>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={runAnalysis} 
            disabled={loading}
            className="h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white"
          >
            {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-2" />}
            {loading ? "PROCESING..." : "RESCAN"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {!insight && !loading && (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <Sparkles className="h-8 w-8 text-primary/30" />
            <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
              SYSTEM_IDLE: AWAITING_OPERATOR_INPUT
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase tracking-widest animate-pulse text-primary">Scanning neural paths...</span>
            </div>
            <Progress value={45} className="h-1 bg-white/5" />
          </div>
        )}

        {insight && !loading && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <Badge variant={insight.isAnomaly ? "destructive" : "secondary"} className="font-mono text-[10px] px-2">
                {insight.isAnomaly ? "ANOMALY_DETECTED" : "NOMINAL_STATUS"}
              </Badge>
              <div className="text-[10px] font-mono text-muted-foreground">
                CONF: {(insight.confidenceScore * 100).toFixed(0)}%
              </div>
            </div>

            <p className="text-xs font-mono leading-relaxed text-muted-foreground">
              {insight.anomalyDescription || "Current data stream matches historical baseline parameters. No deviations found."}
            </p>

            {insight.predictedIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Predictions</h4>
                <ul className="text-[11px] font-mono space-y-1 text-muted-foreground">
                  {insight.predictedIssues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 bg-primary flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insight.recommendations.length > 0 && (
              <div className="space-y-2 p-3 bg-white/5 rounded border border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Protocol Recommendations</h4>
                <ul className="text-[11px] font-mono space-y-1 text-muted-foreground">
                  {insight.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 bg-emerald-500 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-white/5 p-4 border-t border-white/5 mt-auto">
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
          Gemini 2.5 Flash / PVC-CORE-AI
        </p>
      </CardFooter>
    </Card>
  );
}
