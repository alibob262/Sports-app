import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  username: string = '';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}

  async onSignup() {
    try {
      // 1. Create user with email/password
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );

      // 2. Save additional user data (username) to Firestore
      await setDoc(doc(this.firestore, 'users', userCredential.user.uid), {
        username: this.username,
        email: this.email,
        createdAt: new Date()
      });

      // 3. Redirect to home/dashboard
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Signup error:', error);
      alert(this.getUserFriendlyError(error));
    }
  }

  private getUserFriendlyError(error: any): string {
    if (error.code === 'auth/email-already-in-use') {
      return 'This email is already registered.';
    } else if (error.code === 'auth/weak-password') {
      return 'Password should be at least 6 characters.';
    }
    return 'Signup failed. Please try again.';
  }
}