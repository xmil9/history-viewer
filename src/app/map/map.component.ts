import { Component, ElementRef, OnDestroy, ViewChild, afterNextRender, inject } from '@angular/core';
import * as L from 'leaflet';
import { HistoryQueryService } from '../services/history-query.service';
import { HistoryTimeService } from '../services/history-time.service';

const MIN_ZOOM = 0;
const MAX_ZOOM = 19;

function clampZoom(zoom: number): number {
	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

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
	private readonly wheelListenerOptions: AddEventListenerOptions = { passive: false };

	constructor() {
		afterNextRender(() => this.initMap());
	}

	ngOnDestroy(): void {
		if (this.map && this.wheelHandler) {
			this.map.getContainer().removeEventListener('wheel', this.wheelHandler, this.wheelListenerOptions);
		}
		this.map?.remove();
	}

	private initMap(): void {
		const container = this.mapContainer.nativeElement;

		this.map = L.map(container, {
			center: [20, 0],
			zoom: 4,
			zoomSnap: 0.1,    // Allows granular zoom levels
			minZoom: MIN_ZOOM,
			maxZoom: MAX_ZOOM,
			scrollWheelZoom: false,
			worldCopyJump: true,
		});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			maxZoom: MAX_ZOOM,
		}).addTo(this.map);

		let zoomDelta = 1; // Number of zoom levels to change per scroll event
		let lastScrollTime = 0;

		this.wheelHandler = (event: WheelEvent) => {
			event.preventDefault(); // Stop page scrolling

			if (event.ctrlKey || event.metaKey) {
				const direction: 1 | -1 = event.deltaY < 0 ? 1 : -1;
				this.historyTime.stepYear(direction);
				return;
			}

			const now = Date.now();
			// Throttle the zoom to prevent jarring jumps (adjust 100ms as needed)
			if (now - lastScrollTime < 100)
				return;
			lastScrollTime = now;

			// Normalize wheel delta to either -1 or 1
			let delta = event.deltaY > 0 ? -1 : 1;

			const map = this.map!;

			// Get current zoom, round to nearest integer, and apply delta
			let targetZoom = Math.round(map.getZoom()) + (delta * zoomDelta);

			// Constrain zoom to map's min/max bounds
			targetZoom = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), targetZoom));

			// Smoothly pan and zoom to the current mouse position
			map.flyTo(map.mouseEventToLatLng(event), targetZoom, {
				animate: true,
				duration: 0.3
			});
		};

		container.addEventListener('wheel', this.wheelHandler, this.wheelListenerOptions);

		this.map.on('click', (event: L.LeafletMouseEvent) => {
			const { lat, lng } = event.latlng;
			const zoom = clampZoom(this.map!.getZoom());
			this.historyTime.selectLocation(lat, lng, zoom);
			this.historyQuery.request({
				lat,
				lng,
				zoom,
				year: this.historyTime.currentYear(),
			});
		});
	}
}
