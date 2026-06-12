import { Component, ElementRef, OnDestroy, ViewChild, afterNextRender, inject } from '@angular/core';
import * as L from 'leaflet';
import { HistoryQueryService } from '../services/history-query.service';
import { HistoryTimeService } from '../services/history-time.service';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private readonly historyTime = inject(HistoryTimeService);
  private readonly historyQuery = inject(HistoryQueryService);

  private map?: L.Map;
  private wheelHandler?: (event: WheelEvent) => void;

  constructor() {
    afterNextRender(() => this.initMap());
  }

  ngOnDestroy(): void {
    if (this.map && this.wheelHandler) {
      this.map.getContainer().removeEventListener('wheel', this.wheelHandler);
    }
    this.map?.remove();
  }

  private initMap(): void {
    const container = this.mapContainer.nativeElement;

    this.map = L.map(container, {
      center: [20, 0],
      zoom: 2,
      scrollWheelZoom: true,
      worldCopyJump: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.wheelHandler = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const direction: 1 | -1 = event.deltaY < 0 ? 1 : -1;
      this.historyTime.stepYear(direction);
    };

    container.addEventListener('wheel', this.wheelHandler, { passive: false });

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      const zoom = this.map!.getZoom();
      this.historyTime.setCenter(lat, lng, zoom);
      this.historyQuery.request({
        lat,
        lng,
        zoom,
        year: this.historyTime.currentYear(),
      });
    });
  }
}
