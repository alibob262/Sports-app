import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Auth } from '@angular/fire/auth';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const user = auth.currentUser;
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const isAdmin = await authService.isAdmin(user.uid);
  if (!isAdmin) {
    router.navigate(['/']);
    return false;
  }

  return true;
};