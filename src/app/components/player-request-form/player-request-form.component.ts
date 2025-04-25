import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule, NgForm } from '@angular/forms';
import { PlayerRequestService } from '../../services/player-request.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface SportOption {
  value: string;
  displayName: string;
  positions: PositionOption[];
}

interface PositionOption {
  value: string;
  displayName: string;
}

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
  availablePositions: PositionOption[] = [];
  
  // Sport options with positions
  sports: SportOption[] = [
    {
      value: 'football',
      displayName: 'Football',
      positions: [
        { value: 'goalkeeper', displayName: 'Goalkeeper' },
        { value: 'defender', displayName: 'Defender' },
        { value: 'midfielder', displayName: 'Midfielder' },
        { value: 'attacker', displayName: 'Attacker' }
      ]
    },
    {
      value: 'basketball',
      displayName: 'Basketball',
      positions: [
        { value: 'point-guard', displayName: 'Point Guard' },
        { value: 'shooting-guard', displayName: 'Shooting Guard' },
        { value: 'small-forward', displayName: 'Small Forward' },
        { value: 'power-forward', displayName: 'Power Forward' },
        { value: 'center', displayName: 'Center' }
      ]
    },
    {
      value: 'volleyball',
      displayName: 'Volleyball',
      positions: [
        { value: 'setter', displayName: 'Setter' },
        { value: 'outside-hitter', displayName: 'Outside Hitter' },
        { value: 'middle-blocker', displayName: 'Middle Blocker' },
        { value: 'opposite-hitter', displayName: 'Opposite Hitter' },
        { value: 'libero', displayName: 'Libero' }
      ]
    },
    {
      value: 'tennis',
      displayName: 'Tennis',
      positions: [
        { value: 'singles', displayName: 'Singles' },
        { value: 'doubles', displayName: 'Doubles' }
      ]
    }
  ];
 
  // User info
  userName = '';
  userId = '';
  
  // Submission state
  isSubmitting = false;
  isSuccess = false;
  submitMessage = '';
  
  ngOnInit(): void {
    this.userName = this.auth.currentUser?.displayName || 'Unknown';
    this.userId = this.auth.currentUser?.uid || '';
  }
  
  onSportChange(): void {
    this.position = ''; // Reset position when sport changes
    const selectedSport = this.sports.find(s => s.value === this.sport);
    this.availablePositions = selectedSport ? [...selectedSport.positions] : [];
  }
  
  selectPosition(position: string): void {
    this.position = position;
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
        this.availablePositions = [];
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