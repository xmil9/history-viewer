export type HistorySource = 'gemini' | 'groq' | 'ollama' | 'mock' | 'cache';

export interface HistoryEvent {
  year?: number;
  title: string;
  detail: string;
}

export interface HistoryResponse {
  placeName: string;
  periodLabel: string;
  summary: string;
  events: HistoryEvent[];
  confidence: 'high' | 'medium' | 'low';
  source: HistorySource;
}

export interface HistoryRequest {
  lat: number;
  lng: number;
  year: number;
  zoom: number;
}
