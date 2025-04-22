import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule, NgForm } from '@angular/forms';
import { PlayerRequestService } from '../../services/player-request.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-player-request-form',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './player-request-form.component.html',
  styleUrls: ['./player-request-form.component.scss']
})
export class PlayerRequestFormComponent implements OnInit {
  private requestService = inject(PlayerRequestService);
  private auth = inject(Auth);
  
  // Form fields
  sport = '';
  position = '';
  sports = ['football', 'basketball', 'volleyball', 'tennis'];
 
  // User info
  userName = '';
  userId = '';
  
  // Submission state
  isSubmitting = false;
  isSuccess = false;
  submitMessage = '';
  
  ngOnInit(): void {
    // Get user info on component initialization
    this.userName = this.auth.currentUser?.displayName || 'Unknown';
    this.userId = this.auth.currentUser?.uid || '';
  }
  
  async onSubmit() {
    if (!this.userId || !this.sport || !this.position) return;
   
    this.isSubmitting = true;
    this.submitMessage = '';
    
    try {
      await this.requestService.addRequest({
        userId: this.userId,
        userName: this.userName,
        sport: this.sport,
        position: this.position
      });
      
      this.isSuccess = true;
      this.submitMessage = 'Request submitted successfully!';
     
      setTimeout(() => {
        this.sport = '';
        this.position = '';
        this.submitMessage = '';
      }, 3000);
    } catch (error) {
      this.isSuccess = false;
      this.submitMessage = 'Failed to submit request. Please try again.';
      console.error('Submission error:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
}