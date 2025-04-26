import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  UserCredential,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  User,
  onAuthStateChanged,
  user
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, updateDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Add this observable for current user
  currentUser$: Observable<User | null>;

  constructor() {
    this.currentUser$ = user(this.auth);
  }

  async getUserRoles(uid: string): Promise<{ user: boolean, admin: boolean }> {
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));
    return userDoc.data()?.['roles'] || { user: false, admin: false };
  }
  
  async isAdmin(uid: string): Promise<boolean> {
    const roles = await this.getUserRoles(uid);
    return roles.admin;
  }

async signup(email: string, password: string, username: string): Promise<UserCredential> {
  try {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    
    await setDoc(doc(this.firestore, 'users', userCredential.user.uid), {
      username,
      email,
      emailVerified: false,
      createdAt: new Date(),
      lastLogin: null,
      roles: {
        user: true,
        admin: false
      }
    });

    await sendEmailVerification(userCredential.user);
    return userCredential;
  } catch (error) {
    throw this.handleAuthError(error);
  }
}
  
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async logout(redirectTo: string = '/login'): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate([redirectTo]);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => resolve(user));
    });
  }

  async resendVerificationEmail(user: User): Promise<void> {
    try {
      await sendEmailVerification(user);
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  private async createUserDocument(uid: string, data: any): Promise<void> {
    await setDoc(doc(this.firestore, 'users', uid), data);
  }

  private async updateUserDocument(uid: string, data: any): Promise<void> {
    await updateDoc(doc(this.firestore, 'users', uid), data);
  }

  private handleAuthError(error: any): { code: string, message: string } {
    console.error('Full auth error:', error);
    
    if (!error || !error.code) {
      return {
        code: 'unknown',
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  
    const errorMap: Record<string, string> = {
      'auth/invalid-credential': 'Invalid email or password',
      'auth/invalid-email': 'Invalid email address',
      'auth/user-disabled': 'Account disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/too-many-requests': 'Account temporarily locked due to too many attempts',
      'auth/operation-not-allowed': 'Email/password login is not enabled'
    };
  
    return {
      code: error.code,
      message: errorMap[error.code] || error.message || 'Authentication failed'
    };
  }
}