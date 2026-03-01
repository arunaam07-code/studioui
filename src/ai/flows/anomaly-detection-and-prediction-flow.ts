'use server';
/**
 * @fileOverview This file implements a Genkit flow for anomaly detection and prediction in a stirred tank bioreactor.
 *
 * - detectAnomalyAndPredict - A function that analyzes sensor data to detect anomalies and predict potential issues.
 * - AnomalyDetectionInput - The input type for the detectAnomalyAndPredict function.
 * - AnomalyDetectionOutput - The return type for the detectAnomalyAndPredict function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SensorReadingsSchema = z.object({
  temperature: z.number().describe('Current temperature in Celsius.'),
  pH: z.number().describe('Current pH level.'),
  flowrate: z.number().describe('Current flowrate in L/min.'),
  BOD: z.number().describe('Current Biochemical Oxygen Demand in mg/L.'),
  COD: z.number().describe('Current Chemical Oxygen Demand in mg/L.'),
  turbidity: z.number().describe('Current turbidity in NTU.'),
  conductivity: z.number().describe('Current conductivity in µS/cm.'),
  gasLevelPpm: z.number().describe('Current gas level in parts per million (ppm).'),
  humidity: z.number().describe('Current humidity in percent.'),
});

const AnomalyDetectionInputSchema = z.object({
  currentReadings: SensorReadingsSchema.describe('Real-time sensor data from the bioreactor.'),
  historicalReadings: z.array(
    SensorReadingsSchema.extend({
      timestamp: z.string().datetime().describe('Timestamp of the historical reading in ISO 8601 format.'),
    })
  ).describe('A collection of past sensor data readings for trend analysis.').optional(),
});
export type AnomalyDetectionInput = z.infer<typeof AnomalyDetectionInputSchema>;

const AnomalyDetectionOutputSchema = z.object({
  isAnomaly: z.boolean().describe('True if any unusual pattern or anomaly is detected in the current sensor data compared to historical trends and known thresholds.'),
  anomalyDescription: z.string().describe('A detailed explanation of the detected anomaly, including which parameters are out of normal range or exhibiting unusual patterns. Empty string if no anomaly.'),
  predictedIssues: z.array(z.string()).describe('A list of potential system issues, component failures, or threshold breaches that are predicted to occur based on current trends and anomalies.'),
  recommendations: z.array(z.string()).describe('Proactive recommendations or actions that the operator should take to address the detected anomalies or prevent predicted issues.'),
  confidenceScore: z.number().min(0).max(1).describe('A confidence score (0.0 to 1.0) indicating the certainty of the anomaly detection and prediction.'),
});
export type AnomalyDetectionOutput = z.infer<typeof AnomalyDetectionOutputSchema>;

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    if (retries > 0 && (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED'))) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function detectAnomalyAndPredict(input: AnomalyDetectionInput): Promise<AnomalyDetectionOutput> {
  return anomalyDetectionAndPredictionFlow(input);
}

const anomalyDetectionPrompt = ai.definePrompt({
  name: 'anomalyDetectionPrompt',
  input: {schema: AnomalyDetectionInputSchema},
  output: {schema: AnomalyDetectionOutputSchema},
  prompt: `You are an AI expert in biovalorisation processes for PVC waste, specialized in bioreactor monitoring, anomaly detection, and predictive maintenance.
Your goal is to analyze the provided real-time and historical sensor data from a stirred tank bioreactor, identify any unusual patterns or anomalies, predict potential system issues or threshold breaches before they occur, and provide proactive recommendations.

Consider the following sensor data:

Current Sensor Readings:
Temperature: {{{currentReadings.temperature}}} °C
pH: {{{currentReadings.pH}}}
Flowrate: {{{currentReadings.flowrate}}} L/min
BOD: {{{currentReadings.BOD}}} mg/L
COD: {{{currentReadings.COD}}} mg/L
Turbidity: {{{currentReadings.turbidity}}} NTU
Conductivity: {{{currentReadings.conductivity}}} µS/cm
Gas Level: {{{currentReadings.gasLevelPpm}}} ppm
Humidity: {{{currentReadings.humidity}}} %

{{#if historicalReadings}}
Historical Sensor Readings (for trend analysis and baseline comparison):
{{#each historicalReadings}}
  Timestamp: {{{this.timestamp}}}, Temp: {{{this.temperature}}} °C, pH: {{{this.pH}}}, Flowrate: {{{this.flowrate}}} L/min, BOD: {{{this.BOD}}} mg/L, COD: {{{this.COD}}} mg/L, Turbidity: {{{this.turbidity}}} NTU, Conductivity: {{{this.conductivity}}} µS/cm, Gas: {{{this.gasLevelPpm}}} ppm, Humidity: {{{this.humidity}}} %
{{/each}}
{{else}}
No historical data provided. Base analysis solely on current readings and general biovalorisation process knowledge.
{{/if}}

Analyze the data for:
1.  **Anomalies**: Are any current readings significantly deviating from normal operating ranges or recent historical trends?
2.  **Trends**: Are there any alarming trends in the historical data that suggest an impending issue?
3.  **Predictions**: Based on anomalies and trends, what potential system issues, threshold breaches (e.g., high gas, high temperature, unusual pH), or equipment malfunctions could occur soon?
4.  **Recommendations**: What proactive steps should a reactor operator take immediately or in the near future to address the findings and maintain optimal process efficiency and safety?

Provide your response in a JSON object strictly adhering to the AnomalyDetectionOutputSchema, described as:
{{jsonSchema AnomalyDetectionOutputSchema}}`,
});

const anomalyDetectionAndPredictionFlow = ai.defineFlow(
  {
    name: 'anomalyDetectionAndPredictionFlow',
    inputSchema: AnomalyDetectionInputSchema,
    outputSchema: AnomalyDetectionOutputSchema,
  },
  async (input) => {
    return withRetry(async () => {
      const {output} = await anomalyDetectionPrompt(input);
      return output!;
    });
  }
);
