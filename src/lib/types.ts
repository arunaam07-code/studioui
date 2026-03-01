export type SensorData = {
  temperature: number;
  pH: number;
  flowrate: number;
  BOD: number;
  COD: number;
  turbidity: number;
  conductivity: number;
  gasLevelPpm: number;
  humidity: number;
};

export type HistoricalReading = SensorData & {
  timestamp: string;
};

export type ReactorStatus = 'SAFE' | 'WARNING' | 'ALERT';

export type Contaminant = {
  category: 'ORGANIC' | 'METAL' | 'GLASS' | 'OTHER';
  label: string;
  isHazardous: boolean;
  recommendation: string;
  suggestedRoute?: 'PYROLYSIS' | 'RECYCLING' | 'DISPOSAL';
};

export type SegregationReport = {
  hasContaminants: boolean;
  detectedContaminants: Contaminant[];
};

export type PlasticAnalysisResult = {
  plasticType: string;
  confidence: number;
  recommendedMicrobe: string;
  suitabilityExplanation: string;
  estimatedProcessingTime: string;
  segregationReport: SegregationReport;
};

export type ByproductData = {
  biogasVolume: number; // in Liters
  processedBiomass: number; // in kg
  liquidEffluent: number; // in Liters
};

export type ReactorInstance = {
  id: string;
  name: string;
  analysisResult: PlasticAnalysisResult;
  currentData: SensorData;
  byproducts: ByproductData;
  history: HistoricalReading[];
  status: ReactorStatus;
  startTime: string;
  isBluetoothConnected: boolean;
};

export type PyrolysisData = {
  temperature: number;
  pressure: number;
  charYield: number;
  oilYield: number;
  gasYield: number;
};

export type PyrolysisInstance = {
  id: string;
  contaminantLabel: string;
  currentData: PyrolysisData;
  history: (PyrolysisData & { timestamp: string })[];
  status: 'HEATING' | 'STABLE' | 'COOLING' | 'ALERT';
};
