import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { CourtListComponent } from './components/court-list/court-list.component';
import { authGuard, unauthGuard, verifiedGuard } from './guards/auth.guard'; // Add verifiedGuard
import { SignupComponent } from './components/auth/signup/signup.component';
import { TeamFormComponent } from './components/team-form/team-form.component';
import { PasswordResetComponent } from './components/auth/password-reset/password-reset.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { DashboardComponent } from './components/dashboard/dashboard.component'; // Suggested addition
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { adminGuard } from './guards/admin.guard';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard, verifiedGuard], // Combined guards
    title: 'Dashboard' 
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [unauthGuard],
    title: 'Login' 
  },
  { 
    path: 'signup', 
    component: SignupComponent,
    canActivate: [unauthGuard],
    title: 'Sign Up' 
  },
  { 
    path: 'teams', 
    component: TeamFormComponent,
    canActivate: [authGuard, verifiedGuard],
    title: 'Teams' 
  },
  { 
    path: 'password-reset', 
    component: PasswordResetComponent,
    title: 'Reset Password' 
  },
  { 
    path: 'verify-email', 
    component: VerifyEmailComponent,
    canActivate: [authGuard], 
    title: 'Verify Email' 
  },

  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [authGuard, adminGuard],
    title: 'Admin Dashboard' 
  },
  { 
    path: 'courts', 
    component: CourtListComponent,
    canActivate: [authGuard, verifiedGuard],
    title: 'Find Courts' 
  },
  // { 
  //   path: 'profile', 
  //   loadChildren: () => import('./components/profile/profile.routes')
  //     .then(m => m.PROFILE_ROUTES) 
  // },
  { path: 'profile', component: ProfileComponent },
  { 
    path: '**', 
    redirectTo: 'dashboard' // Handle 404
  }
];