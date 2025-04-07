import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { user, Auth, updateProfile } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { EditNameModalComponent } from '../edit-name-modal/edit-name-modal.component';
import { doc, updateDoc, Firestore } from '@angular/fire/firestore'; // Import Firestore

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
    // Observing the authenticated user

  // Inject Firestore into the constructor
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private dialog = inject(MatDialog);

  user$ = user(this.auth);

  constructor() {}

  // Open the edit name modal and update user profile and Firestore
  openEditModal(user: any) {
    this.dialog.open(EditNameModalComponent, {
      data: { currentName: user.displayName },
      width: '300px'
    }).afterClosed().subscribe(newName => {
      if (newName) {
        updateProfile(this.auth.currentUser!, { displayName: newName })  // Update Firebase Auth profile
          .then(() => {
            console.log("Auth updated");
            // Update Firestore with the new display name
            return updateDoc(doc(this.firestore, 'users', this.auth.currentUser!.uid), {
              displayName: newName,
              lastUpdated: new Date()
            });
          })
          .then(() => console.log("Firestore updated"))
          .catch(err => console.error("Error:", err));
      }
    });
  }
}
