import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourtService } from '../../services/court.service';

@Component({
  selector: 'app-court-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './court-list.component.html',
  styleUrls: ['./court-list.component.scss']
})
export class CourtListComponent implements OnInit {
  courts$ = this.courtService.getCourts();
  sports = ['football', 'basketball', 'tennis', 'padel'];
  selectedSports: string[] = [];
  selectedType: '' | 'indoor' | 'outdoor' = '';

  constructor(private courtService: CourtService) {}

  ngOnInit() {
    // Optionally load the courts on initialization
    // this.loadCourts();
  }

  // Change the parameter to cast the target as an HTMLInputElement
  toggleSport(sport: string, event: Event) {
    const target = event.target as HTMLInputElement; // Cast target to HTMLInputElement

    if (target && target.checked) {
      this.selectedSports = [...this.selectedSports, sport];
    } else {
      this.selectedSports = this.selectedSports.filter(s => s !== sport);
    }
    this.applyFilters();
  }

  applyFilters() {
    this.courts$ = this.courtService.getCourts({
      sports: this.selectedSports,
      type: this.selectedType
    });
  }

  resetFilters() {
    this.selectedSports = [];
    this.selectedType = '';
    this.applyFilters();
  }

  // Call this function to add dummy courts
  addDummyCourts() {
    this.courtService.addDummyCourts().then(() => {
      alert('Dummy courts added!');
    }).catch((error) => {
      console.error('Error adding dummy courts: ', error);
    });
  }
}
