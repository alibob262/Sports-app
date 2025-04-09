import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatList, MatListItem } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-request-to-join-dialog',
  standalone: true,
  imports: [CommonModule,MatDialogModule,MatButtonModule,MatSelectModule,FormsModule],
  templateUrl: './request-to-join-dialog.component.html',
  styleUrl: './request-to-join-dialog.component.scss'
})


export class RequestToJoinDialog {
  selectedPosition!: string;

  constructor(
    public dialogRef: MatDialogRef<RequestToJoinDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { availablePositions: string[] }
  ) {
    this.selectedPosition = this.data.availablePositions[0];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}