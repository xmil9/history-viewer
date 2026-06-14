import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { HistoryQueryService } from '../services/history-query.service';
import {
  HistoryTimeService,
  MAX_YEAR,
  MIN_YEAR,
  parseYearInput,
} from '../services/history-time.service';

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
  readonly editingYear = signal(false);
  readonly yearDraft = signal('');

  private readonly yearInput = viewChild<ElementRef<HTMLInputElement>>('yearInput');

  startEditingYear(): void {
    this.yearDraft.set(String(this.historyTime.currentYear()));
    this.editingYear.set(true);
    queueMicrotask(() => {
      const input = this.yearInput()?.nativeElement;
      input?.focus();
      input?.select();
    });
  }

  commitYear(): void {
    const parsed = parseYearInput(this.yearDraft());
    if (parsed === null) {
      this.editingYear.set(false);
      return;
    }

    const previousYear = this.historyTime.currentYear();
    this.historyTime.setYear(parsed);
    this.editingYear.set(false);

    const location = this.historyTime.selectedLocation();
    const nextYear = this.historyTime.currentYear();
    if (location !== null && nextYear !== previousYear) {
      this.historyQuery.request({
        ...location,
        year: nextYear,
      });
    }
  }

  cancelYearEdit(): void {
    this.editingYear.set(false);
  }

  onYearKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitYear();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelYearEdit();
    }
  }
}
