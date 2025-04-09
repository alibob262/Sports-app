import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { Auth, User, user } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone:true,
  imports:[CommonModule,RouterModule],
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  private auth: Auth = inject(Auth);
  public router = inject(Router);
  private authService = inject(AuthService);
  private userSubscription: Subscription;
  
  currentUser: User | null = null;
  menuOpen = false;
  isAdmin = false;

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  constructor() {
    this.userSubscription = user(this.auth).subscribe(async (aUser: User | null) => {
      this.currentUser = aUser;
      this.isAdmin = aUser ? await this.authService.isAdmin(aUser.uid) : false;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  isTeamRouteActive(): boolean {
  return this.router.url.includes('/teams');
  }

  async logout() {
    try {
      await this.authService.logout();
      this.menuOpen = false;
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }
}