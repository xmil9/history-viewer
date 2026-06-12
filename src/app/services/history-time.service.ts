import { Injectable, computed, signal } from '@angular/core';

const MIN_YEAR = -3000;
const MAX_YEAR = new Date().getFullYear();

export interface MapCenter {
  lat: number;
  lng: number;
  zoom: number;
}

@Injectable({ providedIn: 'root' })
export class HistoryTimeService {
  readonly currentYear = signal(new Date().getFullYear());
  readonly center = signal<MapCenter>({ lat: 20, lng: 0, zoom: 2 });

  readonly formattedYear = computed(() => formatYear(this.currentYear()));

  stepYear(direction: 1 | -1): void {
    const next = yearStep(this.currentYear(), direction);
    this.currentYear.set(clampYear(next));
  }

  setCenter(lat: number, lng: number, zoom: number): void {
    this.center.set({ lat, lng, zoom });
  }
}

export function yearStep(currentYear: number, direction: 1 | -1): number {
  const abs = Math.abs(currentYear);
  const step =
    abs >= 1900 ? 5 :
    abs >= 1500 ? 25 :
    abs >= 500 ? 100 :
    500;
  return currentYear + direction * step;
}

export function clampYear(year: number): number {
  return Math.min(MAX_YEAR, Math.max(MIN_YEAR, year));
}

export function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BCE`;
  }
  if (year === 0) {
    return '1 BCE / 1 CE';
  }
  return `${year} CE`;
}
