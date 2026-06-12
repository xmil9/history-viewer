import { Component, inject } from '@angular/core';
import { HistoryQueryService } from '../services/history-query.service';
import { HistoryTimeService } from '../services/history-time.service';

@Component({
  selector: 'app-history-panel',
  standalone: true,
  templateUrl: './history-panel.component.html',
  styleUrl: './history-panel.component.scss',
})
export class HistoryPanelComponent {
  readonly historyTime = inject(HistoryTimeService);
  readonly historyQuery = inject(HistoryQueryService);
}
