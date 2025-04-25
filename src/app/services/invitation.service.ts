import { inject, Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection } from '@angular/fire/firestore';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';

interface TeamData {
  sport: string;
  name?: string;
}

interface InvitationData {
  teamId: string;
  playerId: string;
  position: string;
  teamData: TeamData;
}

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private firestore = inject(Firestore);
  private notificationService = inject(NotificationService);
  private emailService = inject(EmailService);

  async sendInvitation(
    teamId: string, 
    playerId: string, 
    position: string, 
    teamData: TeamData
  ): Promise<string> {
    try {
      // 1. Create invitation document
      const invitationRef = doc(collection(this.firestore, 'invitations'));
      const invitationId = invitationRef.id;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      await setDoc(invitationRef, {
        id: invitationId,
        teamId,
        playerId,
        position,
        sport: teamData.sport,
        status: 'pending',
        sentAt: new Date(),
        expiresAt
      });

      // 2. Create notification for player
      await this.notificationService.sendNotification(
        playerId,
        `You've been invited to join ${teamData.name || teamData.sport + ' team'} as ${position}`,
        'invitation',
        { 
          invitationId,
          teamId,
          position,
          sport: teamData.sport
        }
      );

      // 3. Send email notification
      await this.emailService.sendInvitationEmail(playerId, {
        invitationId,
        teamId,
        position,
        sport: teamData.sport,
        name: teamData.name,
        expiresAt
      });

      return invitationId;
    } catch (error) {
      console.error('Full invitation error:', error);
      throw new Error('Failed to send invitation');
    }
  }
}