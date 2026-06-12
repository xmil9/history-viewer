import { z } from 'zod';

export const historyRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  year: z.number().int().min(-3000).max(new Date().getFullYear()),
  zoom: z.number().min(0).max(22),
});

export const historyResponseSchema = z.object({
  placeName: z.string(),
  periodLabel: z.string(),
  summary: z.string(),
  events: z.array(
    z.object({
      year: z.number().optional(),
      title: z.string(),
      detail: z.string(),
    }),
  ),
  confidence: z.enum(['high', 'medium', 'low']),
  source: z.enum(['gemini', 'groq', 'ollama', 'mock', 'cache']),
});

export type HistoryRequest = z.infer<typeof historyRequestSchema>;
export type HistoryResponse = z.infer<typeof historyResponseSchema>;

export type HistorySource = HistoryResponse['source'];
