import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvitationService } from '../../services/invitation.service';
import { AuthService } from '../../services/auth.service';
import { switchMap } from 'rxjs/operators';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

interface Invitation {
  id: string;
  teamId: string;
  playerId: string;
  position: string;
  sport: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  sentAt: any; // Firestore Timestamp or Date
  expiresAt: any;
  teamName?: string;
}

@Component({
  selector: 'app-invitation-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss']
})
export class InvitationListComponent {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private invitationService = inject(InvitationService);

  invitations$: Observable<Invitation[]>;
  isLoading = true;

  constructor() {
    this.invitations$ = this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user) return of([]);
        
        const invitationsRef = collection(this.firestore, 'invitations');
        const q = query(
          invitationsRef, 
          where('playerId', '==', user.uid),
          where('status', '==', 'pending')
        );
        
        return collectionData(q, { idField: 'id' }) as Observable<Invitation[]>;
      })
    );
  }

  async acceptInvitation(invitation: Invitation): Promise<void> {
    try {
      await this.invitationService.updateInvitationStatus(invitation.id, 'accepted');
      // Add logic to add player to the team
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  }

  async rejectInvitation(invitation: Invitation): Promise<void> {
    try {
      await this.invitationService.updateInvitationStatus(invitation.id, 'rejected');
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }
}