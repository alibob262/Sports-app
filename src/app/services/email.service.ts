import { inject, Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private firestore = inject(Firestore);
  private functions = inject(Functions);

  async sendInvitationEmail(playerId: string, invitationData: any): Promise<void> {
    try {
      // 1. Get player's email from their profile
      const userDoc = await getDoc(doc(this.firestore, 'users', playerId));
      const userData = userDoc.data();
      
      if (!userData || !userData['email']) {
        console.error('No user data or email found for user:', playerId);
        return;
      }

      const userEmail = userData['email'];
      const teamName = invitationData.name || `${invitationData.sport} Team`;

      // 2. Prepare email data with all required fields
      const emailData = {
        to: userEmail,
        from: 'noreply@malaabna-sports.com', // Replace with your verified domain
        replyTo: 'support@malaabna-sports.com',
        message: {
          subject: `You've been invited to join ${teamName}!`,
          html: this.generateInvitationEmailHtml(teamName, invitationData),
          text: this.generateInvitationEmailText(teamName, invitationData)
        }
      };

      // 3. Option 1: Using Firebase Trigger Email extension (via Firestore)
      await addDoc(collection(this.firestore, 'mail'), emailData);
      console.log('Email request successfully added to mail collection');

      // 3. Option 2: Using Cloud Function (alternative approach)
      // const sendEmail = httpsCallable(this.functions, 'sendEmail');
      // await sendEmail(emailData);
      
    } catch (error) {
      console.error('Full email sending error:', error);
      throw error; // Re-throw to handle in calling function
    }
  }

  private generateInvitationEmailHtml(teamName: string, invitationData: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4285f4;">Team Invitation</h2>
        <p>You've been invited to join <strong>${teamName}</strong> as <strong>${invitationData.position}</strong>.</p>
        <p>Sport: ${invitationData.sport}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://malaabna-sports-app-2025.web.app/invitations/${invitationData.invitationId}"
             style="background-color: #4285f4; color: white; padding: 12px 20px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Invitation
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          This invitation will expire on ${new Date(invitationData.expiresAt).toLocaleDateString()}.
        </p>
      </div>
    `;
  }

  private generateInvitationEmailText(teamName: string, invitationData: any): string {
    return `
      Team Invitation
      ----------------
      You've been invited to join ${teamName} as ${invitationData.position}.
      Sport: ${invitationData.sport}
      
      To accept this invitation, please visit:
      https://malaabna-sports-app-2025.web.app/invitations/${invitationData.invitationId}
      
      This invitation will expire on ${new Date(invitationData.expiresAt).toLocaleDateString()}.
    `;
  }
}