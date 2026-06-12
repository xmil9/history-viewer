import { buildMockHistory } from './mock-data';
import { reverseGeocode } from './geocode';
import { generateHistory } from './llm';
import { HistoryRequest, HistoryResponse, historyRequestSchema } from './types';

const historyCache = new Map<string, HistoryResponse>();

function cacheKey(lat: number, lng: number, year: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)},${year}`;
}

export async function handleHistoryRequest(body: unknown): Promise<HistoryResponse> {
  const request: HistoryRequest = historyRequestSchema.parse(body);
  const key = cacheKey(request.lat, request.lng, request.year);

  const cached = historyCache.get(key);
  if (cached) {
    return { ...cached, source: 'cache' };
  }

  const placeName = await reverseGeocode(request.lat, request.lng);

  try {
    const generated = await generateHistory(
      placeName,
      request.lat,
      request.lng,
      request.year,
    );
    historyCache.set(key, generated);
	console.log('generated:', generated);
    return generated;
  } catch {
	console.log('error generating history, using mock data');
    const mock = buildMockHistory(request.lat, request.lng, request.year, placeName);
    historyCache.set(key, mock);
    return mock;
  }
}
