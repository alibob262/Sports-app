import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourtService } from '../../services/court.service';
import { Observable, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-court-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './court-list.component.html',
  styleUrls: ['./court-list.component.scss']
})
export class CourtListComponent implements OnInit {
  // Location variables
  userLat: number | null = null;
  userLng: number | null = null;
  isNearMeMode: boolean = true; // Default to "Near Me" mode
  locationError: boolean = false;

  // Court data variables
  courts$!: Observable<any[]>;
  filteredCourts: any[] = [];
  sports = ['football', 'basketball', 'tennis', 'padel'];
  selectedSports: string[] = [];
  selectedType: '' | 'indoor' | 'outdoor' = '';

  constructor(private courtService: CourtService) {}

  async ngOnInit() {
    await this.getUserLocation();
    this.loadCourts();
  }

  // Toggle between Near Me and All Courts
  toggleNearMe(nearMe: boolean): void {
    this.isNearMeMode = nearMe;
    this.applyFilters();
  }

  // Get user location
  async getUserLocation(): Promise<void> {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLat = position.coords.latitude;
            this.userLng = position.coords.longitude;
            this.locationError = false;
            resolve();
          },
          (error) => {
            console.error("Geolocation error:", error);
            this.locationError = true;
            this.isNearMeMode = false; // Fallback to All Courts
            resolve();
          },
          { timeout: 10000 } // 10 second timeout
        );
      } else {
        console.error("Geolocation not supported");
        this.locationError = true;
        this.isNearMeMode = false; // Fallback to All Courts
        resolve();
      }
    });
  }

  // Load courts with initial filters
  loadCourts(): void {
    this.courts$ = this.courtService.getCourts();
    this.applyFilters();
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * 
      Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  // Convert degrees to radians
  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Apply all active filters
  applyFilters(): void {
    this.courts$.pipe(
      map(courts => {
        // Apply sport and type filters first
        let filtered = courts.filter(court => {
          const sportMatch = this.selectedSports.length === 0 || 
            this.selectedSports.some(sport => court.sports.includes(sport));
          const typeMatch = !this.selectedType || court.type === this.selectedType;
          return sportMatch && typeMatch;
        });

        // Apply proximity filter if in Near Me mode and location is available
        if (this.isNearMeMode && this.userLat && this.userLng && !this.locationError) {
          filtered = filtered
            .map(court => ({
              ...court,
              distance: this.calculateDistance(
                this.userLat!,
                this.userLng!,
                court.location.geo.latitude,
                court.location.geo.longitude
              )
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3); // Get top 3 nearest courts
        }

        return filtered;
      })
    ).subscribe(filtered => {
      this.filteredCourts = filtered;
    });
  }

  // Toggle sport selection
  toggleSport(sport: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target?.checked) {
      this.selectedSports = [...this.selectedSports, sport];
    } else {
      this.selectedSports = this.selectedSports.filter(s => s !== sport);
    }
    this.applyFilters();
  }

  // Reset all filters
  resetFilters(): void {
    this.selectedSports = [];
    this.selectedType = '';
    this.isNearMeMode = true;
    if (!this.locationError) {
      this.getUserLocation().then(() => this.applyFilters());
    } else {
      this.applyFilters();
    }
  }

  // Add dummy courts (existing function)
  addDummyCourts(): void {
    this.courtService.addDummyCourts().then(() => {
      alert('Dummy courts added!');
      this.loadCourts();
    }).catch((error) => {
      console.error('Error adding dummy courts: ', error);
    });
  }
}