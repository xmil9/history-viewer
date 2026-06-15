import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { HistoryRequest, HistoryResponse } from '../models/history-response.model';

interface QueryParams {
  lat: number;
  lng: number;
  startYear: number;
  endYear: number;
  zoom: number;
}

@Injectable({ providedIn: 'root' })
export class HistoryQueryService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, HistoryResponse>();
  private readonly querySubject = new Subject<QueryParams>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly response = signal<HistoryResponse | null>(null);
  readonly sourceLabel = computed(() => sourceToLabel(this.response()?.source));

  constructor() {
    this.querySubject
      .pipe(
        debounceTime(600),
        distinctUntilChanged(
          (a, b) =>
            a.lat.toFixed(2) === b.lat.toFixed(2) &&
            a.lng.toFixed(2) === b.lng.toFixed(2) &&
            a.startYear === b.startYear &&
            a.endYear === b.endYear,
        ),
        switchMap((params) => this.fetchHistory(params)),
      )
      .subscribe();
  }

  request(params: QueryParams): void {
    this.querySubject.next(params);
  }

  private fetchHistory(params: QueryParams) {
    const key = cacheKey(params);
    const cached = this.cache.get(key);
    if (cached) {
      this.error.set(null);
      this.response.set({ ...cached, source: 'cache' });
      return of(cached);
    }

    this.loading.set(true);
    this.error.set(null);

    const body: HistoryRequest = {
      lat: params.lat,
      lng: params.lng,
      startYear: params.startYear,
      endYear: params.endYear,
      zoom: params.zoom,
    };

    return this.http.post<HistoryResponse>('/api/history', body).pipe(
      tap((result) => {
        this.cache.set(key, result);
        this.response.set(result);
      }),
      catchError((err: HttpErrorResponse) => {
        const message =
          typeof err.error?.error === 'string'
            ? err.error.error
            : err.message || 'Failed to load history.';
        this.error.set(message);
        return of(null);
      }),
      finalize(() => this.loading.set(false)),
      map(() => null),
    );
  }
}

function cacheKey(params: QueryParams): string {
  return `${params.lat.toFixed(2)},${params.lng.toFixed(2)},${params.startYear},${params.endYear}`;
}

function sourceToLabel(source: HistoryResponse['source'] | undefined): string {
  switch (source) {
    case 'gemini':
      return 'Generated via free Gemini tier';
    case 'groq':
      return 'Generated via free Groq tier';
    case 'ollama':
      return 'Generated locally via Ollama';
    case 'mock':
      return 'Sample data (no API key configured)';
    case 'cache':
      return 'Cached result';
    default:
      return '';
  }
}
