import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../services/team.service';
import { PlayerRequestService } from '../../services/player-request.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvitationService } from '../../services/invitation.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

interface PositionOption {
  value: string;
  displayName: string;
}

interface Player {
  userId: string;
  userName: string;  // This is the correct property name
  email?: string;
  position: string;
  sport: string;
  // Add any other player properties you need
}

@Component({
  selector: 'app-player-invite',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './player-invite.component.html',
  styleUrls: ['./player-invite.component.scss']
})
export class PlayerInviteComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teamService = inject(TeamService);
  private playerRequestService = inject(PlayerRequestService);
  private invitationService = inject(InvitationService);
  private snackBar = inject(MatSnackBar);

  teamId = this.route.snapshot.params['id'];
  team$ = this.teamService.getTeam(this.teamId);
  selectedPosition: string | null = null;
  availablePlayers: Player[] = [];
  isLoading = false;
  isSendingInvitation = false;

  positionMap: Record<string, PositionOption[]> = {
    football: [
      { value: 'goalkeeper', displayName: 'Goalkeeper' },
      { value: 'defender', displayName: 'Defender' },
      { value: 'midfielder', displayName: 'Midfielder' },
      { value: 'attacker', displayName: 'Attacker' }
    ],
    basketball: [
      { value: 'point-guard', displayName: 'Point Guard' },
      { value: 'shooting-guard', displayName: 'Shooting Guard' },
      { value: 'small-forward', displayName: 'Small Forward' },
      { value: 'power-forward', displayName: 'Power Forward' },
      { value: 'center', displayName: 'Center' }
    ],
    volleyball: [
      { value: 'setter', displayName: 'Setter' },
      { value: 'outside-hitter', displayName: 'Outside Hitter' },
      { value: 'middle-blocker', displayName: 'Middle Blocker' },
      { value: 'opposite-hitter', displayName: 'Opposite Hitter' },
      { value: 'libero', displayName: 'Libero' }
    ],
    tennis: [
      { value: 'singles', displayName: 'Singles' },
      { value: 'doubles', displayName: 'Doubles' }
    ]
  };

  async selectPosition(position: string): Promise<void> {
    this.selectedPosition = position;
    await this.loadPlayers(position);
  }

  async loadPlayers(position: string): Promise<void> {
    this.isLoading = true;
    this.availablePlayers = [];

    try {
      const team = await firstValueFrom(this.team$);
      if (!team) {
        console.error('Team not found');
        this.showError('Team not found');
        return;
      }

      const players = await firstValueFrom(
        this.playerRequestService.getPlayersBySportAndPosition(team.sport, position)
      );

      this.availablePlayers = players;
    } catch (error) {
      console.error('Error loading players:', error);
      this.showError('Failed to load players');
    } finally {
      this.isLoading = false;
    }
  }

  async invitePlayer(player: Player): Promise<void> {
    if (!this.selectedPosition) {
      this.showError('Please select a position first');
      return;
    }

    this.isSendingInvitation = true;

    try {
      const team = await firstValueFrom(this.team$);
      if (!team) {
        throw new Error('Team data not available');
      }

      await this.invitationService.sendInvitation(
        this.teamId,
        player.userId,
        this.selectedPosition,
        {
          sport: team.sport,
          name:`${team.sport} Team`
        }
      );

      this.showSuccess(`Invitation sent to ${player.userName || 'player'}`);
    } catch (error) {
      console.error('Error sending invitation:', error);
      this.showError('Failed to send invitation');
    } finally {
      this.isSendingInvitation = false;
    }
  }

  goBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  getPositionDisplayName(sport: string, positionValue: string): string {
    const positions = this.positionMap[sport] || [];
    const position = positions.find(p => p.value === positionValue);
    return position ? position.displayName : positionValue;
  }
}