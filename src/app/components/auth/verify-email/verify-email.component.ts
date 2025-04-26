// verify-email.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditNameModalComponent } from '../../edit-name-modal/edit-name-modal.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  email: string | null = null;
  isVerified = false;
  isLoading = true;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    this.email = user?.email || null;
    
    if (user?.emailVerified) {
      this.isVerified = true;
      // Check if user has a display name
      if (!user.displayName) {
        // Redirect to profile and open modal
        this.router.navigate(['/profile'], { 
          state: { requireNameSetup: true } 
        });
      } else {
        // Redirect to dashboard if name is already set
        this.router.navigate(['/dashboard']);
      }
    }
    this.isLoading = false;
  }

  async resendVerification() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      await this.authService.resendVerificationEmail(user);
    }
  }
}