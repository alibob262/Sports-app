import { CommonModule, Location } from '@angular/common';  // Add Location to imports
import { Component, inject, OnInit } from '@angular/core';
import { user, Auth, updateProfile } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { EditNameModalComponent } from '../edit-name-modal/edit-name-modal.component';
import { doc, updateDoc, Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private location = inject(Location);

  user$ = user(this.auth);

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const requireNameSetup = navigation?.extras.state?.['requireNameSetup'];
    
    if (requireNameSetup) {
      this.user$.subscribe(user => {
        if (user && !user.displayName) {
          this.openEditModal(user, true);
        } else {
          // If they somehow got here without needing name setup, redirect them
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }
  
  openEditModal(user: any, isForced: boolean = false) {
    const dialogRef = this.dialog.open(EditNameModalComponent, {
      data: { 
        currentName: user.displayName,
        isForced: isForced 
      },
      width: '300px',
      disableClose: isForced,
      hasBackdrop: isForced // Prevents clicking outside
    });
  
    dialogRef.afterClosed().subscribe(newName => {
      if (newName) {
        updateProfile(this.auth.currentUser!, { displayName: newName })
          .then(() => {
            return updateDoc(doc(this.firestore, 'users', this.auth.currentUser!.uid), {
              displayName: newName,
              lastUpdated: new Date()
            });
          })
          .then(() => {
            if (isForced) {
              this.router.navigate(['/dashboard']);
            }
          })
          .catch(err => console.error("Error:", err));
      } else if (isForced) {
        // If they closed without setting name, prevent navigation
        this.location.back(); // Or show warning
      }
    });
  }
}