import { Route } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { authGuard } from '../../guards/auth.guard';

export const PROFILE_ROUTES: Route[] = [
  { 
    path: '', 
    component: ProfileComponent,
    canActivate: [authGuard] 
  }
];