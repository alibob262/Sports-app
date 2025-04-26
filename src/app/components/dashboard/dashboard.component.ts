import { Component } from '@angular/core';
import { InvitationListComponent } from '../invitation-list/invitation-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [InvitationListComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
