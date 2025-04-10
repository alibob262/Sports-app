import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-name-modal',
  standalone: true,
  imports: [CommonModule,MatDialogModule,FormsModule,MatButtonModule,MatInputModule],
  templateUrl: './edit-name-modal.component.html',
  styleUrl: './edit-name-modal.component.scss'
})
export class EditNameModalComponent {
  newName: string;

  constructor(
    public dialogRef: MatDialogRef<EditNameModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentName: string }
  ) {
    this.newName = data.currentName || '';
  }

  onSave() {
    this.dialogRef.close(this.newName.trim());
  }

  onCancel() {
    this.dialogRef.close();
  }
}