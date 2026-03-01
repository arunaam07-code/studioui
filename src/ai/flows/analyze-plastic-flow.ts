'use server';
/**
 * @fileOverview This file implements a Genkit flow for comprehensive waste stream analysis.
 *
 * - analyzePlastic - Identifies multiple waste types and suggests valorisation routes.
 *   Explicitly handles organic contaminants like cotton with pyrolysis recommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePlasticInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of waste materials, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePlasticInput = z.infer<typeof AnalyzePlasticInputSchema>;

const AnalyzePlasticOutputSchema = z.object({
  plasticType: z.string().describe('The primary plastic type(s) identified (e.g., "PVC & PET Mix").'),
  confidence: z.number().min(0).max(1).describe('Confidence score of the material identification.'),
  recommendedMicrobe: z.string().describe('The most suitable microbe or microbial consortium for the identified plastic components.'),
  suitabilityExplanation: z.string().describe('Explanation of the microbial choice.'),
  estimatedProcessingTime: z.string().describe('Estimated duration for biovalorisation.'),
  segregationReport: z.object({
    hasContaminants: z.boolean().describe('True if non-plastic materials are detected.'),
    detectedContaminants: z.array(z.object({
      category: z.enum(['ORGANIC', 'METAL', 'GLASS', 'OTHER']),
      label: z.string().describe('Specific item identification (e.g., "Used Medical Cotton").'),
      isHazardous: z.boolean().describe('True if the item is a biohazard.'),
      recommendation: z.string().describe('Instructions for handling.'),
      suggestedRoute: z.enum(['PYROLYSIS', 'RECYCLING', 'DISPOSAL']).describe('Optimal route for this specific contaminant.')
    })).describe('List of all non-plastic items that must be segregated.')
  })
});
export type AnalyzePlasticOutput = z.infer<typeof AnalyzePlasticOutputSchema>;

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

export async function analyzePlastic(input: AnalyzePlasticInput): Promise<AnalyzePlasticOutput> {
  return analyzePlasticFlow(input);
}

const analyzePlasticPrompt = ai.definePrompt({
  name: 'analyzePlasticPrompt',
  input: {schema: AnalyzePlasticInputSchema},
  output: {schema: AnalyzePlasticOutputSchema},
  prompt: `You are a world-class AI system for waste characterization and biovalorisation.

Analyze the provided image containing potentially mixed waste materials.
1. Identify all plastic polymers present.
2. Recommend the ideal microbe or engineered consortium for biovalorisation.

CRITICAL MATERIAL DETECTION & PYROLYSIS REDIRECTION:
Scan for non-plastic contaminants. 
- ORGANIC WASTE: If you detect medical textiles like used cotton/gauze or heavy organics, you MUST suggest 'PYROLYSIS' as the suggestedRoute.
- METALS/GLASS: Suggest 'RECYCLING'.
- HAZARDOUS: Flag as isHazardous.

Explain that organic matter like cotton should be diverted to a Pyrolytic Chamber to ensure the main bioreactor is not compromised by bio-interference or mechanical clogging.

Image: {{media url=photoDataUri}}`,
});

const analyzePlasticFlow = ai.defineFlow(
  {
    name: 'analyzePlasticFlow',
    inputSchema: AnalyzePlasticInputSchema,
    outputSchema: AnalyzePlasticOutputSchema,
  },
  async (input) => {
    return withRetry(async () => {
      const {output} = await analyzePlasticPrompt(input);
      return output!;
    });
  }
);
