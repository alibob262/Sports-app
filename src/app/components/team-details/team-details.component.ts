import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TeamService } from '../../services/team.service';
import { Team } from '../../models/team.model';
import { RequestListComponent } from '../request-list/request-list.component';
import { RequestToJoinDialog } from '../request-to-join-dialog/request-to-join-dialog.component';
import { Auth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    RequestListComponent,
    RouterModule
  ],
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss']
})
export class TeamDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(Auth);
  
  teamId = this.route.snapshot.params['id'];
  team$ = this.teamService.getTeam(this.teamId);
  isTeamOwner$ = this.team$.pipe(
    map(team => team?.creatorId === this.auth.currentUser?.uid)
  );

  constructor(
    private teamService: TeamService,
    private dialog: MatDialog
  ) {}

  goBack(): void {
    this.router.navigate(['/teams']);
  }

  // Convert Timestamp to Date if needed
  convertToDate(datetime: Date | Timestamp): Date {
    return datetime instanceof Timestamp ? datetime.toDate() : datetime;
  }

  // Safe property access
  getOptional(obj: any, prop: string, fallback: any = ''): any {
    return obj && obj.hasOwnProperty(prop) ? obj[prop] : fallback;
  }

  requestToJoin(team: Team): void {
    const dialogRef = this.dialog.open(RequestToJoinDialog, {
      data: { 
        availablePositions: this.getAvailablePositions(team),
        teamDetails: {
          sport: team.sport,
          location: team.location.name,
          datetime: this.convertToDate(team.datetime),
          creatorName: this.getOptional(team, 'creatorName', 'Organizer')
        }
      }
    });
  
    dialogRef.afterClosed().subscribe((position: string) => {
      if (position) {
        this.teamService.requestToJoin(team.id!, position).then(() => {
          console.log('Join request submitted successfully');
        }).catch(error => {
          console.error('Error submitting request:', error);
        });
      }
    });
  }

  private getAvailablePositions(team: Team): string[] {
    const positionsFilled = team.positionsFilled || {};
    return team.positionsNeeded.filter(pos => {
      const filled = positionsFilled[pos] || 0;
      return filled < team.neededPlayers;
    });
  }
}