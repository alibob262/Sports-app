import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  username: string = '';
  isLoading=false;
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}

  
async onSignup() {
  this.isLoading=true;
  try {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      this.email,
      this.password
    );

    await setDoc(doc(this.firestore, 'users', userCredential.user.uid), {
      username: this.username,
      email: this.email,
      emailVerified: false,
      createdAt: new Date()
    });

    try {
      await sendEmailVerification(userCredential.user);
      this.router.navigate(['/verify-email']);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      alert('Could not send verification email. Please try again later.');
    }
    
  } catch (error) {
    console.error('Signup error:', error);
    alert(this.getUserFriendlyError(error));
  }
  finally{
    this.isLoading=false;
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