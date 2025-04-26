import { inject, Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection, updateDoc, query, where, getDocs } from '@angular/fire/firestore';
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

export interface Invitation {
  id: string;
  teamId: string;
  playerId: string;
  position: string;
  sport: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  sentAt: any;
  expiresAt: any;
  respondedAt?: any;
  teamName?: string;
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

  async updateInvitationStatus(invitationId: string, status: 'accepted' | 'rejected'): Promise<void> {
    try {
      const invitationRef = doc(this.firestore, `invitations/${invitationId}`);
      await updateDoc(invitationRef, { 
        status,
        respondedAt: new Date() 
      });
    } catch (error) {
      console.error('Error updating invitation status:', error);
      throw new Error('Failed to update invitation status');
    }
  }

  async getInvitationsForPlayer(playerId: string): Promise<Invitation[]> {
    const invitationsRef = collection(this.firestore, 'invitations');
    const q = query(
      invitationsRef, 
      where('playerId', '==', playerId),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation));
  }
}