// name-setup.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NameSetupGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate() {
    return user(this.auth).pipe(
      take(1),
      map(user => {
        if (user?.displayName) {
          return true;
        } else {
          this.router.navigate(['/profile'], { 
            state: { requireNameSetup: true } 
          });
          return false;
        }
      })
    );
  }
}