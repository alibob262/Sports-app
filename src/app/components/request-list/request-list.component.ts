import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TeamService } from '../../services/team.service';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { JoinRequest } from '../../models/team.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule,MatListModule,MatProgressSpinnerModule],
  templateUrl: './request-list.component.html',
  styleUrl: './request-list.component.scss'
})
export class RequestListComponent {
  @Input() teamId!: string;
  requests$!: Observable<JoinRequest[]>;

  constructor(private teamService: TeamService) {}

  ngOnInit() {
    this.requests$ = this.teamService.getJoinRequests(this.teamId);
  }

  processRequest(requestId: string, action: 'accept' | 'reject') {
    this.teamService.processJoinRequest(requestId, action)
      .then(() => {
        this.requests$ = this.teamService.getJoinRequests(this.teamId); // Refresh the request list
      })
      .catch(error => {
        console.error('Error processing request:', error);
        alert(`Failed to ${action} request: ${error.message}`);
      });
  }
  
}