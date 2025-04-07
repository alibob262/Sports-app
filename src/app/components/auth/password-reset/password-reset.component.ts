import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent {
  email: string = '';
  isLoading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  private auth = inject(Auth);
  private router = inject(Router);

  async resetPassword() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.successMessage = `Password reset email sent to ${this.email}`;
      setTimeout(() => this.router.navigate(['/login']), 3000);
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  private getErrorMessage(code: string): string {
    const messages: { [key: string]: string } = {
      'auth/invalid-email': 'Invalid email address',
      'auth/user-not-found': 'No account found with this email',
      'auth/too-many-requests': 'Too many attempts. Try again later',
      'auth/missing-email': 'Email is required'
    };
    return messages[code] || 'Failed to send reset email. Please try again.';
  }
}