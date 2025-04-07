import { Component, Input, OnDestroy, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-preview',
  template: `
    <div *ngIf="isBrowser" class="map-container" [id]="'map-' + courtId"></div>
  `,
  styles: [`
    .map-container {
      height: 200px;
      width: 100%;
      border-radius: 8px;
    }
  `]
})
export class MapPreviewComponent implements AfterViewInit, OnDestroy {
  @Input() courtId!: string;
  @Input() lat!: number;
  @Input() lng!: number;
  private map: L.Map | null = null;
  isBrowser: boolean;

  constructor() {
    // Detect if we're in the browser environment
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.initMap();
    }
  }

  private initMap(): void {
    // Initialize the map when the component is in the browser
    this.map = L.map(`map-${this.courtId}`).setView([this.lat, this.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    L.marker([this.lat, this.lng]).addTo(this.map);
  }

  ngOnDestroy(): void {
    // Remove the map instance when the component is destroyed to clean up
    if (this.map) {
      this.map.remove();
    }
  }
}
