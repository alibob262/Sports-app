import { inject } from '@angular/core';
import { Auth, User, onAuthStateChanged } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(true);
      } else {
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.url } // Preserve attempted URL
        });
        resolve(false);
      }
    });
  });
};

export const verifiedGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user: User | null) => {
      if (user?.emailVerified) {
        resolve(true);
      } else if (user) {
        router.navigate(['/verify-email']);
        resolve(false);
      } else {
        router.navigate(['/login']);
        resolve(false);
      }
    });
  });
};

// Optional: Admin guard if you have admin routes
export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user?.emailVerified) {
        // Check Firestore for admin role
        // const isAdmin = await checkAdminRole(user.uid);
        // resolve(isAdmin);
        resolve(true); // Temporary
      } else {
        router.navigate([user ? '/verify-email' : '/login']);
        resolve(false);
      }
    });
  });
};

export const unauthGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        resolve(true);
      } else {
        router.navigate(['/dashboard']);
        resolve(false);
      }
    });
  });
};