import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

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

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    this.email = user?.email || null;
    
    if (user?.emailVerified) {
      this.isVerified = true;
      setTimeout(() => this.router.navigate(['/dashboard']), 3000);
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