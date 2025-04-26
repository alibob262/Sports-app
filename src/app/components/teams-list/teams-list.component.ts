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
import { Observable, combineLatest, of } from 'rxjs';
import { MatSpinner } from '@angular/material/progress-spinner';
import { Team } from '../../models/team.model';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';
import { Firestore, doc, docData, getDoc } from '@angular/fire/firestore';

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
  private firestore = inject(Firestore);

  teams$: Observable<(Team & { creatorName: string })[]>;
  sports = ['football', 'basketball', 'tennis', 'volleyball'];
  skillLevels = ['beginner', 'intermediate', 'advanced'];
  
  filters = {
    sport: '',
    skillLevel: '',
    dateRange: { start: null as Date | null, end: null as Date | null }
  };

  constructor() {
    this.teams$ = this.loadTeams().pipe(
      catchError(error => {
        console.error('Error loading teams:', error);
        return of([]);
      })
    );
  }

  private loadTeams(): Observable<(Team & { creatorName: string })[]> {
    return this.teamService.getTeams().pipe(
      switchMap(teams => {
        if (!teams?.length) return of([]);
        
        const teamObservables = teams.map(team => {
          const transformedTeam = this.transformTeam(team);
          
          // Use createdId (from your Firebase) with fallback to creatorId
          const creatorId = team.creatorId;
          
          if (!creatorId) {
            console.warn('Team missing creator ID:', team.id);
            return of({ ...transformedTeam, creatorName: 'Organizer' });
          }

          const userDocRef = doc(this.firestore, `users/${creatorId}`);
          return docData(userDocRef).pipe(
            map((user: any) => {
              if (!user) {
                console.warn('User document empty for ID:', creatorId);
                return { ...transformedTeam, creatorName: 'Organizer' };
              }
              
              // Check multiple possible name fields
              const displayName = user.displayName || 
                                 user.name || 
                                 user.username || 
                                 'Organizer';
              
              return {
                ...transformedTeam,
                creatorName: displayName
              };
            }),
            catchError((error) => {
              console.error('Error fetching user:', error);
              return of({ ...transformedTeam, creatorName: 'Organizer' });
            })
          );
        });

        return combineLatest(teamObservables);
      })
    );
  }

  private transformTeam(team: any): Team {
    return {
      ...team,
      datetime: this.convertTimestampToDate(team.datetime),
      positionsFilled: team.positionsFilled || {}
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
      switchMap(teams => {
        if (!teams?.length) return of([]);
        
        return combineLatest(
          teams.map(team => {
            const transformedTeam = this.transformTeam(team);
            const creatorId =  team.creatorId;
            
            if (!creatorId) {
              return of({ ...transformedTeam, creatorName: 'Organizer' });
            }
            
            const userDocRef = doc(this.firestore, `users/${creatorId}`);
            return docData(userDocRef).pipe(
              map((user: any) => ({
                ...transformedTeam,
                creatorName: user?.displayName || user?.name || user?.username || 'Organizer'
              })),
              catchError(() => of({ ...transformedTeam, creatorName: 'Organizer' }))
            );
          })
        );
      })
    );
  }

  clearFilters() {
    this.filters = {
      sport: '',
      skillLevel: '',
      dateRange: { start: null, end: null }
    };
    this.teams$ = this.loadTeams();
  }
}
