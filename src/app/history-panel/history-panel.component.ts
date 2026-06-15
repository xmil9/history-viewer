import { Component, effect, inject, signal } from '@angular/core';
import { HistoryQueryService } from '../services/history-query.service';
import {
  HistoryTimeService,
  MAX_YEAR,
  MIN_YEAR,
  parseYearInput,
} from '../services/history-time.service';

type YearField = 'start' | 'end';

@Component({
  selector: 'app-history-panel',
  standalone: true,
  templateUrl: './history-panel.component.html',
  styleUrl: './history-panel.component.scss',
})
export class HistoryPanelComponent {
  readonly historyTime = inject(HistoryTimeService);
  readonly historyQuery = inject(HistoryQueryService);

  readonly minYear = MIN_YEAR;
  readonly maxYear = MAX_YEAR;
  readonly startDraft = signal(String(this.historyTime.startYear()));
  readonly endDraft = signal(String(this.historyTime.endYear()));
  readonly focusedYearField = signal<YearField | null>(null);

  constructor() {
    effect(() => {
      const start = this.historyTime.startYear();
      const end = this.historyTime.endYear();
      if (this.focusedYearField() !== 'start') {
        this.startDraft.set(String(start));
      }
      if (this.focusedYearField() !== 'end') {
        this.endDraft.set(String(end));
      }
    });
  }

  onYearFocus(field: YearField): void {
    this.focusedYearField.set(field);
  }

  onYearBlur(): void {
    this.focusedYearField.set(null);
    this.commitYearRange();
  }

  commitYearRange(): void {
    const parsedStart = parseYearInput(this.startDraft());
    const parsedEnd = parseYearInput(this.endDraft());
    if (parsedStart === null || parsedEnd === null) {
      this.syncDraftsFromService();
      return;
    }

    const previousStart = this.historyTime.startYear();
    const previousEnd = this.historyTime.endYear();
    const { startYear, endYear } = this.historyTime.setYearRange(parsedStart, parsedEnd);
    this.startDraft.set(String(startYear));
    this.endDraft.set(String(endYear));

    const location = this.historyTime.selectedLocation();
    if (
      location !== null &&
      (startYear !== previousStart || endYear !== previousEnd)
    ) {
      this.historyQuery.request({
        ...location,
        startYear,
        endYear,
      });
    }
  }

  onYearKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      (event.target as HTMLInputElement).blur();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.syncDraftsFromService();
      (event.target as HTMLInputElement).blur();
    }
  }

  private syncDraftsFromService(): void {
    this.startDraft.set(String(this.historyTime.startYear()));
    this.endDraft.set(String(this.historyTime.endYear()));
  }
}
