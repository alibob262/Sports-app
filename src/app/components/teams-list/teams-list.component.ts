import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../services/team.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { MatSpinner } from '@angular/material/progress-spinner';
import { Team } from '../../models/team.model';
import { map, tap } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    RouterModule,
    MatSpinner,
  ],
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.scss']
})
export class TeamsListComponent {
  private teamService = inject(TeamService);

  teams$: Observable<Team[]>;
  sports = ['football', 'basketball', 'tennis', 'volleyball'];
  skillLevels = ['beginner', 'intermediate', 'advanced'];
  
  filters = {
    sport: '',
    skillLevel: '',
    dateRange: { start: null as Date | null, end: null as Date | null }
  };

  // Add this to your TeamsListComponent constructor
constructor() {
  console.log('Initializing TeamsListComponent');
  this.teams$ = this.teamService.getTeams().pipe(
    map(teams => {
      console.log('Teams received:', teams);
      return teams.map(team => this.transformTeam(team));
    }),
    tap(teams => console.log('Transformed teams:', teams))
  );
}

  private transformTeam(team: any): Team {
    return {
      ...team,
      datetime: this.convertTimestampToDate(team.datetime),
      positionsFilled: team.positionsFilled || {} // Provide default empty object
    };
  }

  private convertTimestampToDate(datetime: any): Date {
    return datetime instanceof Timestamp ? datetime.toDate() : datetime;
  }

  applyFilters() {
    const filters = {
      sport: this.filters.sport || undefined,
      skillLevel: this.filters.skillLevel || undefined,
      dateRange: {
        start: this.filters.dateRange.start || undefined,
        end: this.filters.dateRange.end || undefined
      }
    };
    
    this.teams$ = this.teamService.getTeams(filters).pipe(
      map(teams => teams.map(team => this.transformTeam(team)))
    );
  }

  clearFilters() {
    this.filters = {
      sport: '',
      skillLevel: '',
      dateRange: { start: null, end: null }
    };
    this.applyFilters();
  }
}