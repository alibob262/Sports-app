import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { CourtListComponent } from './components/court-list/court-list.component';
import { authGuard, unauthGuard, verifiedGuard } from './guards/auth.guard';
import { SignupComponent } from './components/auth/signup/signup.component';
import { TeamFormComponent } from './components/team-form/team-form.component';
import { PasswordResetComponent } from './components/auth/password-reset/password-reset.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { adminGuard } from './guards/admin.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { TeamsListComponent } from './components/teams-list/teams-list.component';
import { TeamDetailsComponent } from './components/team-details/team-details.component';
import { PlayerRequestFormComponent } from './components/player-request-form/player-request-form.component';
import { PlayerInviteComponent } from './components/player-invite/player-invite.component';
import { NameSetupGuard } from './guards/name-setup.guard';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard, verifiedGuard,NameSetupGuard],
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
    canActivate: [authGuard, verifiedGuard,NameSetupGuard],
    title: 'Find Courts' 
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard, verifiedGuard],
    title: 'My Profile'
  },
  { 
    path: 'player-request', 
    component: PlayerRequestFormComponent,
    canActivate: [authGuard, verifiedGuard,NameSetupGuard],
    title: 'Find a Team'
  },
  { 
    path: 'teams',
    canActivate: [authGuard, verifiedGuard,NameSetupGuard],
    children: [
      { 
        path: '', 
        component: TeamsListComponent, 
        title: 'Teams List' 
      },
      { 
        path: 'new', 
        component: TeamFormComponent, 
        title: 'Create Team' 
      },
      { 
        path: ':id', 
        component: TeamDetailsComponent,
        title: 'Team Details'
      }
    ]
  },
  {
    path: 'teams/:id/invite',
    component: PlayerInviteComponent,
    canActivate: [authGuard, verifiedGuard,NameSetupGuard]
  },
  { 
    path: 'chat', 
    component: ChatbotComponent 
  },
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];