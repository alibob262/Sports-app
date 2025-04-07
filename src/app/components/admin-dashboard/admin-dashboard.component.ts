import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <h2>Admin Dashboard</h2>
      <p *ngIf="isAdmin">Welcome, administrator!</p>
      <div class="admin-actions">
        <button>Manage Users</button>
        <button>View Reports</button>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .admin-actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }
  `]
})
export class AdminDashboardComponent {
  isAdmin = false;

  constructor(private authService: AuthService) {
    this.checkAdminStatus();
  }

  async checkAdminStatus() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.isAdmin = await this.authService.isAdmin(user.uid);
    }
  }
}