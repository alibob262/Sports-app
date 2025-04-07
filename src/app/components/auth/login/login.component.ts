import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    this.isLoading = true;
    this.errorMessage = null;
    
    try {
      const userCredential = await this.authService.login(this.email, this.password);
      
      if (userCredential.user.emailVerified) {
        this.router.navigate(['/courts']);
      } else {
        await this.authService.resendVerificationEmail(userCredential.user);
        this.router.navigate(['/verify-email']);
      }
    } catch (error: any) {
      this.errorMessage = error.message;
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }
}