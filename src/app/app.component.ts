import { Component } from '@angular/core';
import { HistoryPanelComponent } from './history-panel/history-panel.component';
import { MapComponent } from './map/map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MapComponent, HistoryPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
