import { Injectable, computed, signal } from '@angular/core';

const MIN_YEAR = -3000;
const MAX_YEAR = new Date().getFullYear();
const DEFAULT_RANGE_SPAN = 50;

export { MIN_YEAR, MAX_YEAR };

export interface MapCenter {
  lat: number;
  lng: number;
  zoom: number;
}

export interface YearRange {
  startYear: number;
  endYear: number;
}

@Injectable({ providedIn: 'root' })
export class HistoryTimeService {
  readonly endYear = signal(MAX_YEAR);
  readonly startYear = signal(MAX_YEAR - DEFAULT_RANGE_SPAN);
  readonly selectedLocation = signal<MapCenter | null>(null);

  readonly formattedYearRange = computed(() =>
    formatYearRange(this.startYear(), this.endYear()),
  );

  stepYear(direction: 1 | -1): void {
    const delta = yearStep(this.endYear(), direction) - this.endYear();
    this.setYearRange(this.startYear() + delta, this.endYear() + delta);
  }

  setYearRange(startYear: number, endYear: number): YearRange {
    let start = clampYear(startYear);
    let end = clampYear(endYear);
    if (start > end) {
      [start, end] = [end, start];
    }
    this.startYear.set(start);
    this.endYear.set(end);
    return { startYear: start, endYear: end };
  }

  selectLocation(lat: number, lng: number, zoom: number): void {
    this.selectedLocation.set({ lat, lng, zoom });
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

export function parseYearInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const bceMatch = /^(\d+)\s*bce$/i.exec(trimmed);
  if (bceMatch) {
    return -Number(bceMatch[1]);
  }

  const ceMatch = /^(\d+)\s*ce$/i.exec(trimmed);
  if (ceMatch) {
    return Number(ceMatch[1]);
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && Number.isInteger(numeric)) {
    return numeric;
  }

  return null;
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

export function formatYearRange(startYear: number, endYear: number): string {
  return `${formatYear(startYear)} – ${formatYear(endYear)}`;
}
